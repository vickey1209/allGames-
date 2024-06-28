import { formatNewScoreBoardData, formatScoreBoardData } from "../../formatResponseData";
import CommonEventEmitter from '../../commonEventEmitter';
import { EMPTY, EVENTS, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../constants";
import Logger from "../../logger"
import { defaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";
import { userObjInterface } from "../../interfaces/winner";
import { scoreBoardResponse, tableQueue, userResDataInterface } from "../../interfaces/tableConfig";
import { lastDealCache, playerGamePlayCache, tableConfigCache, turnHistoryCache, userProfileCache } from "../../cache";
import { getConfig } from "../../config";
const { NEW_GAME_START_TIMER } = getConfig();
import { insertTableGamePlay } from "../../cache/tableGamePlay";
import { removeQueue } from "../common/queue";
import { UserProfileOutput } from "../../interfaces/userProfile";
import { defaulPlayerGamePlayInterface } from "../../interfaces/playerGamePlay";
import formatMultiPlayerScore from "../../clientsideapi/helper/formatMultiPlayerSubmitScore";
import { markCompletedGameStatus, multiPlayerWinnScore } from "../../clientsideapi";
import { cancelAllScheduler } from "../../scheduler/cancelJob/allScheduler.cancel";
import { scoreBoardTimer } from "../../scheduler/queues/scoreBoardTimer.queue";

async function winnerhandler(
    winnerUserId: string,
    winnerSI: number,
    tableId: string, 
    userId: string,
    userArray: Array<userObjInterface>,
    allUserPGP: Array<userResDataInterface>,
    tableGamePlays: defaultTableGamePlayInterface,
    isDirectWinner: boolean
) {
    try {
        Logger.info(tableId, "FINAL winnerhandler  tableId ::============================>>", tableId);
        Logger.info(tableId, " Starting winnerhandler :: >> NEW_GAME_START_TIMER :: ", NEW_GAME_START_TIMER);
        Logger.info(tableId, "winnerhandler :: allUserPGP :: => ", allUserPGP);
        await removeQueue(tableId);
        const tableGamePlay: defaultTableGamePlayInterface = JSON.parse(JSON.stringify(tableGamePlays));
        Logger.info(tableId, "tableGamePlay :: >>", tableGamePlay);
        tableGamePlay.tableState = TABLE_STATE.SCORE_BOARD;
        await insertTableGamePlay(tableGamePlay, tableId);

        //ScoreBoard event
        let newGameStartTimer: number = NEW_GAME_START_TIMER / NUMERICAL.THOUSAND;
        const scoreData: scoreBoardResponse = await formatScoreBoardData(tableId, allUserPGP, tableGamePlay.trumpCard, newGameStartTimer, true);

        //last deal set
        const playerlistArr = scoreData.scoreBoardTable;
        for (let i = 0; i < playerlistArr.length; i++) {
            const userData = playerlistArr[i];
            await lastDealCache.setLastDeal(userData.userId, scoreData);
        }

        const [winnerUserProfile, tableConfig] = await Promise.all([
            userProfileCache.getUserProfile(winnerUserId),
            tableConfigCache.getTableConfig(tableId)
        ]);
        if (!tableConfig) throw new Error('Unable to get table config');
        if (!winnerUserProfile) throw new Error('Unable to get user data');

        // cancel all timers
        await cancelAllScheduler(tableId);
        // for await (const player of tableGamePlay.seats) {
        //     await cancelPlayerTurnTimer(`${tableId}:${player.userId}:${tableConfig.currentRound}`, tableId);
        //     await cancelSeconderyTimer(`${tableId}:${player.userId}:${tableConfig.currentRound}`, tableId);
        //     await cancelDeclarePlayerTurnTimer(`declare:${tableId}:${player.userId}:${NUMERICAL.ONE}`, tableId);
        // }

        // remove queue if availble
        const key = `${tableConfig.lobbyId}`;
        let getTableQueueArr: tableQueue = await tableConfigCache.getTableFromQueue(key);
        if (getTableQueueArr) {
            Logger.info(tableId, 'getTableQueueArr :: Before :>> ', getTableQueueArr);
            getTableQueueArr.tableId = getTableQueueArr.tableId.filter(x => x != tableId);
        }
        Logger.info(tableId, 'getTableQueueArr :: After:>> ', getTableQueueArr);
        await tableConfigCache.setTableFromQueue(key, getTableQueueArr);


        for await (const element of allUserPGP) {
            // Logger.info('element :===>> ', element);
            if (element.result !== PLAYER_STATE.DECLAREING && element.result !== PLAYER_STATE.LEAVE) {
                let scoreData: scoreBoardResponse = <scoreBoardResponse>{};
                if (isDirectWinner) {
                    scoreData = await formatNewScoreBoardData(tableId, allUserPGP, tableGamePlay.trumpCard, newGameStartTimer, true, true);
                } else {
                    if (element.result === PLAYER_STATE.LOSS) {
                        scoreData = await formatNewScoreBoardData(tableId, allUserPGP, tableGamePlay.trumpCard, newGameStartTimer, true, true);
                    } else {
                        scoreData = await formatNewScoreBoardData(tableId, allUserPGP, tableGamePlay.trumpCard, newGameStartTimer, false, true);
                    }
                }

                const userProfile = await userProfileCache.getUserProfile(element.userId) as UserProfileOutput;
                const userPGP = await playerGamePlayCache.getPlayerGamePlay(element.userId, tableId) as defaulPlayerGamePlayInterface;
                Logger.info(tableId, "winnerhandler ::> userProfile  ===>>", userProfile);
                Logger.info(tableId, "winnerhandler ::> userPGP  =====>>", userPGP);
                if (userProfile.tableId === tableId && userPGP && !userPGP.isDropAndMove) {
                    CommonEventEmitter.emit(EVENTS.SCORE_BOARD_CLIENT_SOCKET_EVENT, {
                        socket: userProfile.socketId,
                        tableId: tableId,
                        data: scoreData
                    });
                }
            }
        }

        for await (const ele of tableGamePlay.seats) {
            if (ele.userState == PLAYER_STATE.WATCHING) {
                let scoreData: scoreBoardResponse = <scoreBoardResponse>{};
                if (isDirectWinner) {
                    scoreData = await formatNewScoreBoardData(tableId, allUserPGP, tableGamePlay.trumpCard, newGameStartTimer, true, true);
                } else {
                    scoreData = await formatNewScoreBoardData(tableId, allUserPGP, tableGamePlay.trumpCard, newGameStartTimer, false, true);
                }
                const userProfile = await userProfileCache.getUserProfile(ele.userId) as UserProfileOutput;
                const userPGP = await playerGamePlayCache.getPlayerGamePlay(ele.userId, tableId) as defaulPlayerGamePlayInterface;
                Logger.info(tableId, "winnerhandler :: > userProfile  =====>>", userProfile);
                Logger.info(tableId, "winnerhandler ::> userPGP  ======>>", userPGP);
                if (userProfile.tableId === tableId && userPGP && !userPGP.isDropAndMove) {
                    CommonEventEmitter.emit(EVENTS.SCORE_BOARD_CLIENT_SOCKET_EVENT, {
                        socket: userProfile.socketId,
                        tableId: tableId,
                        data: scoreData
                    });
                }
            }
        }

        for await (const ele of tableGamePlay.seats) {
            let userProfile = await userProfileCache.getUserProfile(ele.userId) as UserProfileOutput;
            Logger.info(tableId, "User profile ::>>>", userProfile)
            if (userProfile.tableId === tableId) {
                userProfile.tableIds = userProfile.tableIds.filter((el) => tableId != el);
                userProfile.tableId = userProfile.tableIds.length === 0 ? EMPTY : userProfile.tableIds[NUMERICAL.ZERO];
                Logger.info(tableId, "  winnerhandler :: userProfile.tableId ::", userProfile.tableId, "userProfile.tableIds ::=>", userProfile.tableIds)
                await userProfileCache.setUserProfile(ele.userId, userProfile);
            }
        }

        // for multi player score formate and submit api and 
        const apiData = await formatMultiPlayerScore(tableId, winnerUserId, winnerSI, allUserPGP);
        if (!apiData) throw Error('format Multi Player Score not found !');

        const token = await winnerUserProfile.authToken
        await multiPlayerWinnScore(apiData, token, winnerUserProfile.socketId);


        // // add table tracking data
        // await addCurrentRoundData(tableId, allUserPGP);

        //mark Completed Game Status for all user
        for await (const ele of tableGamePlay.seats) {
            const userProfile = await userProfileCache.getUserProfile(ele.userId) as UserProfileOutput;
            const completedGameStatus = await markCompletedGameStatus({
                tableId,
                gameId: userProfile.gameId,
                tournamentId: userProfile.lobbyId
            },
                userProfile.authToken,
                userProfile.socketId
            )
            // await checkBalanceBeforeNewRoundStart(userId, tableId);
        }
        await turnHistoryCache.deleteTurnHistory(tableId);

        //logs add in S3 buckets
        // if(NODE_ENV === 'PRODUCTION' || NODE_ENV === 'STAGE'){
        //     await addLogsInS3Bucket(tableId, tableGamePlay.seats);
        // }

        // next round start scoreBoard timer
        await scoreBoardTimer({
            timer: Number(NEW_GAME_START_TIMER),
            jobId: `StartScoreBoardTimer:${tableId}`,
            tableId: tableId
        })
        Logger.info(tableId, " SCOREDATA :data ===", scoreData);

        return true;
    } catch (error: any) {
        Logger.error(tableId, `winnerhandler Error :: ${error}`)
        Logger.info(tableId, "<<===== winnerhandler() Error ======>>", error);
    }

}

export = winnerhandler;
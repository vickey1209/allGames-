import Logger from "../logger";
import { dropFormator } from "../InputDataFormator";
import { dropInput, dropResponse } from "../interfaces/inputOutputDataFormator";
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache } from "../cache";
import { formatDropData } from "../formatResponseData";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes } from '../interfaces/signup';
import { EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../constants";
import winnerAndScoreBoardManage from "../services/winner/helper/winnerAndScoreBoardManage";
import winnerhandler from "../services/winner";
import Errors from "../errors";
import Lock from '../lock';
import { manageAndUpdateDataInterface } from "../interfaces/manageAndUpdateData";
import manageAndUpdateData from "../utils/manageCardData";
import dropLogic from "../utils/dropLogic";
import { cancelPlayerTurnTimer } from "../scheduler/cancelJob/playerTurnTimer.cancel";
import { cancelSeconderyTimer } from "../scheduler/cancelJob/seconderyTimer.cancel";
import { nextTurnDelay } from "../scheduler/queues/nextTurnDelay.queue";



async function dropHandler(socket: any, dropCard: dropInput): Promise<boolean | errorRes | undefined> {
    const socketId = socket.id;
    const userId = String(dropCard.userId) || socket.userId;
    const tableId = String(dropCard.tableId) || socket.tableId;
    // const lock = await Lock.getLock().acquire([tableId], 2000); 
    let lock:any = null;
    
    try {
        const formatedDropHandlerData = await dropFormator(dropCard);
        Logger.info(tableId," reqData : formatedDropHandlerData ===>> ", formatedDropHandlerData);

        lock = await Lock.getLock().acquire([tableId], 2000);

        const [playerGamePlay, tableGamePlay, tableConfig] = await Promise.all([
            playerGamePlayCache.getPlayerGamePlay(userId, tableId),
            tableGamePlayCache.getTableGamePlay(tableId),
            tableConfigCache.getTableConfig(tableId)
        ])

        if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');
        if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
        if (!tableConfig) throw new Errors.UnknownError('Unable to get table data');

        // Logger.info("======== playerGamePlay.currentCards =====", playerGamePlay.currentCards);
        Logger.info(tableId,"======== tableGamePlay ===== tableGamePlay.tableState ::>", tableGamePlay.tableState);
        if (tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED && tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD) {

            const dropScore = await dropLogic(tableId, userId) as number;
            Logger.info('dropScore :>> ', dropScore);
            tableGamePlay.isSeconderyTimer = false;
            // player counts
            // const PlayingPlayersCount = await countPlayingPlayers(tableGamePlay);
            //TWO PLAYER PLAY
            // Logger.info(" DROP :: PlayingPlayersCount :: =>> ",PlayingPlayersCount)
            if (tableGamePlay.currentPlayerInTable <= NUMERICAL.TWO) {
                playerGamePlay.userStatus = PLAYER_STATE.DROP;
                playerGamePlay.looseingCash = dropScore * tableConfig.entryFee;
                playerGamePlay.dropScore = dropScore;

                //user cards make in one group
                let newArr: string[] = [];
                for (let i = 0; i < playerGamePlay.currentCards.length; i++) {
                    const ele = playerGamePlay.currentCards[i];
                    newArr = newArr.concat(ele);
                }
                playerGamePlay.currentCards = [newArr];

                tableGamePlay.tableState = TABLE_STATE.WINNER_DECLARED;
                for (let i = 0; i < tableGamePlay.seats.length; i++) {
                    const ele = tableGamePlay.seats[i];
                    if (ele.userId == userId) { ele.userState = PLAYER_STATE.DROP; }
                }

                await Promise.all([
                    tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
                    playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId)
                ]);

                const { winnerUserId, winnerSI, allUserPGP, userArray } = await winnerAndScoreBoardManage(userId, tableId, tableGamePlay, tableConfig, PLAYER_STATE.DROP, tableGamePlay.currentPlayerInTable);

                const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
                    await manageAndUpdateData(playerGamePlay.currentCards, playerGamePlay);

                //user drop table
                const formatedDropData: dropResponse =
                    await formatDropData(
                        playerGamePlay.username,
                        playerGamePlay.profilePic,
                        playerGamePlay.seatIndex,
                        playerGamePlay.userId,
                        cards,
                        tableId,
                        PLAYER_STATE.DROP
                    );
                Logger.info(tableId," formatedDropData :: ", formatedDropData);
                CommonEventEmitter.emit(EVENTS.DROP_SOCKET_EVENT, {
                    socket: socketId,
                    tableId: tableId,
                    data: formatedDropData,
                });
                await cancelPlayerTurnTimer(`${tableId}:${userId}:${tableConfig.currentRound}`,tableId);
                await cancelSeconderyTimer(`${tableId}:${userId}:${tableConfig.currentRound}`,tableId);
                await winnerhandler(winnerUserId, winnerSI, tableId, userId, userArray, allUserPGP, tableGamePlay, true);
            }
            else {
                // more then two player, then drop and next user turn 
                Logger.info(tableId," <<== MORE THEN TWO PLAYER : DROP ==>>");

                playerGamePlay.userStatus = PLAYER_STATE.DROP;
                playerGamePlay.looseingCash = dropScore * tableConfig.entryFee;
                playerGamePlay.dropScore = dropScore;

                //user cards make in one group
                let newArr: string[] = [];
                for (let i = 0; i < playerGamePlay.currentCards.length; i++) {
                    const ele = playerGamePlay.currentCards[i];
                    newArr = newArr.concat(ele);
                }
                playerGamePlay.currentCards = [newArr];
                tableGamePlay.currentPlayerInTable -= NUMERICAL.ONE;

                for (let i = 0; i < tableGamePlay.seats.length; i++) {
                    const ele = tableGamePlay.seats[i];
                    if (ele.userId == userId) { ele.userState = PLAYER_STATE.DROP; }
                }

                const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
                    await manageAndUpdateData(playerGamePlay.currentCards, playerGamePlay);

                const formatedDropData: dropResponse =
                    await formatDropData(
                        playerGamePlay.username,
                        playerGamePlay.profilePic,
                        playerGamePlay.seatIndex,
                        playerGamePlay.userId,
                        cards,
                        tableId,
                        PLAYER_STATE.DROP
                    );
                Logger.info(tableId," formatedDropData :: ", formatedDropData);

                await Promise.all([
                    tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
                    playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId)
                ]);

                CommonEventEmitter.emit(EVENTS.DROP_SOCKET_EVENT, {
                    socket: socketId,
                    tableId: tableId,
                    data: formatedDropData,
                });

                Logger.info(" tableGamePlay.tableState ::>>", tableGamePlay.tableState, "tableGamePlay.currentTurn :: ", tableGamePlay.currentTurn)
                if(tableGamePlay.tableState == TABLE_STATE.ROUND_STARTED && userId == tableGamePlay.currentTurn){

                    await cancelPlayerTurnTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
                    await cancelSeconderyTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
                    await nextTurnDelay({
                        timer: NUMERICAL.ONE * NUMERICAL.HUNDRED,
                        jobId: `nextTurn:${tableId}:${NUMERICAL.ONE}`,
                        tableId,
                    });
                }
            }
            return true;
        }
    }
    catch (error: any) {
        Logger.error(tableId,`dropHandler Error :: ${error}`)

        let msg = MESSAGES.ERROR.COMMON_ERROR;
        let nonProdMsg = "";
        let errorCode = 500;

        if (error instanceof Errors.InvalidInput) {
            nonProdMsg = "Invalid Input";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: msg,
                    tableId,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        } else if (error instanceof Errors.UnknownError) {
            nonProdMsg = "FAILED";

            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: msg,
                    tableId,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        } else {
            CommonEventEmitter.emit(EVENTS.DROP_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    success: false,
                    error: {
                        errorCode,
                        errorMessage: error && error.message && typeof error.message === "string"
                            ? error.message
                            : nonProdMsg,
                    },
                }
            });
        }
    }
    finally {
        try {
            if (lock) await Lock.getLock().release(lock);
        } catch (error) {
            Logger.error(tableId,error, ' leaveTable ');
        }
    }
}

export = dropHandler;
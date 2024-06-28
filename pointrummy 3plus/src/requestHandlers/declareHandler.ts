import Logger from "../logger";
import { declareDataFormator } from "../InputDataFormator";
import { declareDataInput, declareDataResponse } from "../interfaces/inputOutputDataFormator";
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../cache";
import { formatDeclareData, formatNewScoreBoardData } from "../formatResponseData";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes } from '../interfaces/signup';
import { EVENTS, NUMERICAL, TABLE_STATE, PLAYER_STATE, MESSAGES, EMPTY } from "../constants";
import { defaulPlayerGamePlayInterface } from "../interfaces/playerGamePlay";
import { scoreBoardResponse, userResDataInterface } from "../interfaces/tableConfig";
import winnerAndScoreBoardManage from "../services/winner/helper/winnerAndScoreBoardManage";
import winnerhandler from "../services/winner";
import Errors from "../errors";
import Lock from "../lock";
import { UserProfileOutput } from "../interfaces/userProfile";
import scoreBoardManage from "../services/winner/helper/scoreBoardManage";
import scoreBoardCalculation from "../services/winner/helper/scoreBoardCalculation";
import { cancelDeclarePlayerTurnTimer } from "../scheduler/cancelJob/declarePlayerTurnTimer.cancel";
import { cancelPlayerTurnTimer } from "../scheduler/cancelJob/playerTurnTimer.cancel";
import { cancelSeconderyTimer } from "../scheduler/cancelJob/seconderyTimer.cancel";
import { declarePlayerTurnTimer } from "../scheduler/queues/declarePlayerTurnTimer.queue";
import { nextTurnDelay } from "../scheduler/queues/nextTurnDelay.queue";


async function declareHandler(socket: any, declareData: declareDataInput): Promise<boolean | errorRes | undefined> {
    let socketId = socket.id;
    const userId: string = String(declareData.userId) || socket.userId;
    const tableId: string = String(declareData.tableId) || socket.tableId;
    // const lock = await Lock.getLock().acquire([`${tableId}`], 2000);
    let lock:any = null;

    try {

        const formatedDeclareData = await declareDataFormator(declareData);
        Logger.info(tableId, " reqData : formatedDeclareData ===>> ", formatedDeclareData);

        lock = await Lock.getLock().acquire([`${tableId}`], 2000);

        const [playerGamePlay, tableGamePlay, tableConfig, userProfile] = await Promise.all([
            playerGamePlayCache.getPlayerGamePlay(userId, tableId),
            tableGamePlayCache.getTableGamePlay(tableId),
            tableConfigCache.getTableConfig(tableId),
            userProfileCache.getUserProfile(userId)
        ])

        if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');
        if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
        if (!tableConfig) throw new Errors.UnknownError('Unable to get table config data');
        if (!userProfile) throw new Errors.UnknownError('Unable to get user Profile data');

        if (socketId != userProfile.socketId) { socketId = userProfile.socketId; }

        const currentCardsLengthCheck: string[] = [];
        playerGamePlay.currentCards.map((ele) => {
            ele.map((e: string) => { currentCardsLengthCheck.push(e) })
        })

        var userSeatIndex: number = NUMERICAL.ZERO;
        tableGamePlay.seats.map((ele, ind) => { if (ele.userId == userId) { userSeatIndex = ele.si; } })

        Logger.info(tableId, " currentCardsLengthCheck ::", currentCardsLengthCheck);
        Logger.info(tableId, " playerGamePlay.userStatus ::", playerGamePlay.userStatus);
        if (tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED && tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD) {
            if (currentCardsLengthCheck.length == NUMERICAL.THIRTEEN && playerGamePlay.userStatus == PLAYER_STATE.DECLAREING) {

                if (playerGamePlay.cardPoints == NUMERICAL.ZERO) {
                    //Valid Show 

                    let validDeclareUserName: string = EMPTY;
                    var userSI: number = NUMERICAL.ZERO;
                    tableGamePlay.tableState = TABLE_STATE.DECLARED;
                    tableGamePlay.validDeclaredPlayer = userId;
                    tableGamePlay.seats.map((ele, ind) => { if (ele.userId == userId) { userSI = ele.si; } })
                    tableGamePlay.validDeclaredPlayerSI = userSI;
                    tableGamePlay.updatedAt = new Date().toString();
                    playerGamePlay.userStatus = PLAYER_STATE.WON;

                    for (let i = 0; i < tableGamePlay.seats.length; i++) {
                        const ele = tableGamePlay.seats[i];
                        if (ele.userId == userId) {
                            ele.userState = PLAYER_STATE.WON;
                            validDeclareUserName = ele.name;
                        }
                    }
                    tableGamePlay.finishCount.push(userId);

                    let PromiseArr: any[] = [];
                    let siArrayOfdeclaringTimeStart = <number[]>[];
                    for (let i = 0; i < tableGamePlay.seats.length; i++) {
                        const ele = tableGamePlay.seats[i];

                        const userPGP: defaulPlayerGamePlayInterface | null = await playerGamePlayCache.getPlayerGamePlay(ele.userId, tableId);
                        let otherUserDeclareData = <declareDataInput>{};
                        otherUserDeclareData.tableId = tableId;
                        otherUserDeclareData.currentRound = NUMERICAL.ONE;
                        if (ele.userId != userId) {
                            otherUserDeclareData.userId = ele.userId;
                        }
                        Logger.info(tableId, " otherUserDeclareData :: ", otherUserDeclareData);

                        if (ele.userId != userId && userPGP?.userStatus == PLAYER_STATE.PLAYING) {
                            siArrayOfdeclaringTimeStart.push(userPGP.seatIndex);
                        }

                        if (ele.userId != userId && ele.userState == PLAYER_STATE.PLAYING) {
                            Logger.info(tableId, "ele.userStatus :: ", ele.userState, "ele.userId :: ", ele.userId);
                            await declarePlayerTurnTimer({
                                timer: tableConfig.declareTimer,
                                jobId: `declare:${tableId}:${ele.userId}:${tableConfig.currentRound}`,
                                data: otherUserDeclareData,
                            })
                        }
                    }
                    Logger.info(tableId, "All user Timer Start : PromiseArr ==>>", PromiseArr);

                    await Promise.all([
                        playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
                        tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
                    ])

                    const formatedDeclareDataResData: declareDataResponse =
                        await formatDeclareData(
                            tableId,
                            userId,
                            userSeatIndex,
                            tableConfig.declareTimer,
                            siArrayOfdeclaringTimeStart,
                            TABLE_STATE.DECLARED,
                            tableGamePlay.tableState
                        );
                    Logger.info(tableId, 'formatedDeclareDataResData : Zero ==>> ::', formatedDeclareDataResData);

                    CommonEventEmitter.emit(EVENTS.DECLARE_SOCKET_EVENT, {
                        tableId: tableId,
                        data: formatedDeclareDataResData
                    });

                    const allUserPGP: userResDataInterface[] = await scoreBoardManage(userId, tableId) as userResDataInterface[];
                    for await (const element of allUserPGP) {
                        // Logger.info('element :>> ', element);
                        if (element.userId === userId || (element.result !== PLAYER_STATE.DECLAREING && element.result !== PLAYER_STATE.LEAVE)) {

                            const scoreData: scoreBoardResponse = await formatNewScoreBoardData(tableId, allUserPGP, tableGamePlay.trumpCard, tableConfig.declareTimer / NUMERICAL.THOUSAND, element.isDeclared);
                            const userProfile = await userProfileCache.getUserProfile(element.userId) as UserProfileOutput;
                            const userPGP = await playerGamePlayCache.getPlayerGamePlay(element.userId, tableId) as defaulPlayerGamePlayInterface;
                            if (userProfile.tableId === tableId && userPGP && !userPGP.isDropAndMove) {
                                CommonEventEmitter.emit(EVENTS.SCORE_BOARD_CLIENT_SOCKET_EVENT, {
                                    socket: userProfile.socketId,
                                    tableId: tableId,
                                    data: scoreData
                                });
                            }
                        }
                    }
                    //except winner, all user valid declaration popUp send
                    for await (const ele of tableGamePlay.seats) {
                        Logger.info(tableId, 'ele :>> ', ele);
                        if (ele.userId !== userId && ele.userState == PLAYER_STATE.PLAYING) {
                            const userPGP: UserProfileOutput | null = await userProfileCache.getUserProfile(ele.userId);
                            let nonProdMsg = "Valid Declaration";
                            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                                socket: userPGP?.socketId,
                                data: {
                                    isPopup: true,
                                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOP_TOAST_POPUP,
                                    title: nonProdMsg,
                                    message: `Player ${validDeclareUserName} ${MESSAGES.ERROR.HAS_MADE_A_VALID_DECLARATION} ${MESSAGES.ERROR.PLEASE_GROUP_YOUR_CARDS_AND_DECLARE}`,
                                    showTimer: false,
                                    tableId
                                },
                            });
                        }
                        if (ele.userState == PLAYER_STATE.WATCHING) {
                            const scoreData: scoreBoardResponse = await formatNewScoreBoardData(tableId, allUserPGP, tableGamePlay.trumpCard, tableConfig.declareTimer / NUMERICAL.THOUSAND, true);
                            const userProfile = await userProfileCache.getUserProfile(ele.userId) as UserProfileOutput;
                            const userPGP = await playerGamePlayCache.getPlayerGamePlay(ele.userId, tableId) as defaulPlayerGamePlayInterface;
                            if (userProfile.tableId === tableId && userPGP && !userPGP.isDropAndMove) {
                                CommonEventEmitter.emit(EVENTS.SCORE_BOARD_CLIENT_SOCKET_EVENT, {
                                    socket: userProfile.socketId,
                                    tableId: tableId,
                                    data: scoreData
                                });
                            }
                        }
                    }

                    await cancelDeclarePlayerTurnTimer(`declare:${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`, tableId);
                    await cancelPlayerTurnTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`, tableId);
                    await cancelSeconderyTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`, tableId);
                }
                else {
                    // Wrong Show or Invalid declaration.
                    //card move to finish deck to open deck;
                    if (tableGamePlay.finishDeck.length > NUMERICAL.ZERO) {
                        let card: string | undefined = tableGamePlay.finishDeck.shift();
                        if (!card) throw new Error('finish Deck is empty');
                        else tableGamePlay.opendDeck.unshift(card);

                        await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);
                    }

                    const formatedDeclareDataResData: declareDataResponse =
                        await formatDeclareData(
                            tableId,
                            userId,
                            userSeatIndex,
                            tableConfig.declareTimer,
                            [],
                            PLAYER_STATE.WRONG_SHOW,
                            tableGamePlay.tableState
                        );
                    Logger.info(tableId, 'formatedDeclareDataResData : Wrong Show ======>>', formatedDeclareDataResData);

                    CommonEventEmitter.emit(EVENTS.DECLARE_SOCKET_EVENT, {
                        tableId: tableId,
                        data: formatedDeclareDataResData
                    });

                    let nonProdMsg = "you made an invalid declare";
                    CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                        socket: socketId,
                        data: {
                            isPopup: true,
                            popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOP_TOAST_POPUP,
                            title: nonProdMsg,
                            message: MESSAGES.ERROR.YOU_MADE_AN_INVALID_DECLARE,
                            showTimer: false,
                            tableId
                        },
                    });

                    if (tableGamePlay.currentPlayerInTable <= NUMERICAL.TWO) {// if two players then, winner and score cards event declared
                        if (tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED && tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD) {
                            tableGamePlay.tableState = TABLE_STATE.WINNER_DECLARED;
                            tableGamePlay.updatedAt = new Date().toString();
                            playerGamePlay.userStatus = PLAYER_STATE.WRONG_SHOW;
                            for (let i = 0; i < tableGamePlay.seats.length; i++) {
                                const ele = tableGamePlay.seats[i];
                                if (ele.userId == userId) { ele.userState = PLAYER_STATE.WRONG_SHOW; }
                            }
                            playerGamePlay.looseingCash = NUMERICAL.EIGHTY * tableConfig.entryFee;

                            await Promise.all([
                                tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
                                playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId)
                            ]);

                            const { winnerUserId, winnerSI, allUserPGP, userArray } = await winnerAndScoreBoardManage(userId, tableId, tableGamePlay, tableConfig, PLAYER_STATE.WRONG_SHOW, tableGamePlay.currentPlayerInTable);

                            Logger.info(tableId, "<<<===== winnerUserId ====>>>", winnerUserId);
                            Logger.info(tableId, "<<<===== winnerSI ====>>>", winnerSI);

                            await winnerhandler(winnerUserId, winnerSI, tableId, userId, userArray, allUserPGP, tableGamePlay, true);
                        }

                    } else {// change turn to other players in table

                        tableGamePlay.currentPlayerInTable -= NUMERICAL.ONE;
                        playerGamePlay.userStatus = PLAYER_STATE.WRONG_SHOW;
                        tableGamePlay.tableState = TABLE_STATE.ROUND_STARTED;
                        for (let i = 0; i < tableGamePlay.seats.length; i++) {
                            const ele = tableGamePlay.seats[i];
                            if (ele.userId == userId) { ele.userState = PLAYER_STATE.WRONG_SHOW; }
                        }
                        playerGamePlay.looseingCash = NUMERICAL.EIGHTY * tableConfig.entryFee;

                        await Promise.all([
                            playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
                            tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
                        ])

                        await cancelDeclarePlayerTurnTimer(`declare:${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`, tableId)
                        await cancelPlayerTurnTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`, tableId);
                        await cancelSeconderyTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`, tableId);
                        await nextTurnDelay({
                            timer: NUMERICAL.ONE * NUMERICAL.ZERO,
                            jobId: `nextTurn:${tableId}:${NUMERICAL.ONE}`,
                            tableId,
                        });

                    }

                }
            }
            else if (tableGamePlay.tableState == TABLE_STATE.DECLARED) {

                Logger.info(tableId, "<<=== Zero point scoreBoard ===>>");
                if (playerGamePlay.userStatus == PLAYER_STATE.PLAYING) {
                    playerGamePlay.userStatus = PLAYER_STATE.LOSS;
                    for (let i = 0; i < tableGamePlay.seats.length; i++) {
                        const ele = tableGamePlay.seats[i];
                        if (ele.userId == userId) { ele.userState = PLAYER_STATE.LOSS; }
                    }
                    tableGamePlay.finishCount.push(userId);
                }

                await Promise.all([
                    playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
                    tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
                ])

                Logger.info(tableId, "<<===== tableGamePlay.finishCount.length ===>>", tableGamePlay.finishCount.length);

                // after first valid declare event send 
                const formatedDeclareDataResData: declareDataResponse =
                    await formatDeclareData(
                        tableId,
                        userId,
                        userSeatIndex,
                        tableConfig.declareTimer,
                        [],
                        PLAYER_STATE.LOSS,
                        tableGamePlay.tableState
                    );
                Logger.info(tableId, '<<====== formatedDeclareDataResData : Zero ====>>', formatedDeclareDataResData);

                CommonEventEmitter.emit(EVENTS.DECLARE_SOCKET_EVENT, {
                    tableId: tableId,
                    data: formatedDeclareDataResData
                });

                playerGamePlay.looseingCash = Number((playerGamePlay.cardPoints * tableConfig.entryFee).toFixed(2));

                await Promise.all([
                    playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
                    tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
                ])

                await scoreBoardCalculation(tableId, userId);

                await cancelDeclarePlayerTurnTimer(`declare:${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`, tableId);
                await cancelPlayerTurnTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`, tableId);
                await cancelSeconderyTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`, tableId);
            }
            return true;
        }
    }
    catch (error: any) {
        Logger.error(`declareHandler Error :>>: ${error}`)

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
            CommonEventEmitter.emit(EVENTS.DECLARE_SOCKET_EVENT, {
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
    } finally {
        try {
            if (lock) await Lock.getLock().release(lock);
        } catch (error) {
            Logger.error(tableId, error, ' leaveTable ');
        }
    }
}

export = declareHandler;








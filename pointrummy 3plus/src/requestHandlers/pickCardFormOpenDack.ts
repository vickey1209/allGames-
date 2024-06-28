import Logger from "../logger";
import { pickCardFormOpenDackFormator } from "../InputDataFormator";
import { pickCardFormOpenDackInput, pickCardFormOpenDackResponse } from "../interfaces/inputOutputDataFormator";
import { playerGamePlayCache, tableGamePlayCache } from "../cache";
import { formatPickCardFormOpenDackData } from "../formatResponseData";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes } from '../interfaces/signup';
import { EVENTS, NUMERICAL, EMPTY, CARDS_STATUS, MESSAGES, ERROR_TYPE, TABLE_STATE } from "../constants";
import { manageAndUpdateDataInterface } from "../interfaces/manageAndUpdateData";
import manageAndUpdateData from "../utils/manageCardData";
import Errors from "../errors";
import { throwErrorIF } from "../interfaces/throwError";
import Lock from '../lock';


async function pickCardFormOpenDackHandler(socket: any, pickCard: pickCardFormOpenDackInput): Promise<boolean | errorRes | undefined> {
    const socketId = socket.id;
    const userId = String(pickCard.userId) || socket.userId;
    const tableId = String(pickCard.tableId) || socket.tableId;
    // const lock = await Lock.getLock().acquire([`${tableId}`], 2000);
    let lock:any = null;
    try {

        const formatedpickCardFormOpenDackData = await pickCardFormOpenDackFormator(pickCard);
        Logger.info(tableId," reqData : formatedpickCardFormOpenDackData ====>> ", formatedpickCardFormOpenDackData);

        lock = await Lock.getLock().acquire([`${tableId}`], 2000);

        const [playerGamePlay, tableGamePlay] = await Promise.all([
            playerGamePlayCache.getPlayerGamePlay(userId, tableId),
            tableGamePlayCache.getTableGamePlay(tableId)
        ])

        if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');
        if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
        // if table state is winner or scoreboard tham this code not run
        if (tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED && tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD) {
            if (tableGamePlay.currentTurn !== userId) {

                const errorObj: throwErrorIF = {
                    type: ERROR_TYPE.USER_THROW_CARD_ERROR,
                    message: MESSAGES.ERROR.CURRENT_TURN_IS_NOT_YOUR_ERROR_MESSAGES,
                    isToastPopup: true,
                };
                throw errorObj;
            }
            // Logger.info("======== tableGamePlay =====", tableGamePlay.closedDeck);

            const opendDeck: string[] = tableGamePlay.opendDeck;
            const currentCards: string[] = [];

            playerGamePlay.currentCards.map((ele) => {
                ele.map((e: string) => { currentCards.push(e) })
            })
            Logger.info(tableId,"<<=== currentCards.length : Before ===>>", currentCards.length);
            let tosswinnerUserId = tableGamePlay.seats.filter((e) =>e.si == tableGamePlay.tossWinPlayer);
            Logger.info(tableId," tosswinnerUserId :: =>>", tosswinnerUserId);
            Logger.info(tableId," tableGamePlay.totalPickCount:: =>>", tableGamePlay.totalPickCount);
            if (currentCards.length == NUMERICAL.THIRTEEN) {

                let msg: string = EMPTY;
                let pickOneCard: string[] = opendDeck.splice(NUMERICAL.ZERO, NUMERICAL.ONE);
                let tempSplit = pickOneCard[NUMERICAL.ZERO].split('_');
                Logger.info(tableId," tempSplit[NUMERICAL.TWO] :: >>", tempSplit[NUMERICAL.TWO])

                if (
                    (tempSplit[NUMERICAL.TWO] == 'J' && tableGamePlay.totalPickCount != NUMERICAL.ZERO ) || 
                    (tempSplit[NUMERICAL.TWO] == 'J' && userId != tosswinnerUserId[0].userId && tableGamePlay.totalPickCount == NUMERICAL.ZERO) ||
                    (tempSplit[NUMERICAL.TWO] == 'J' && userId == tosswinnerUserId[0].userId &&  playerGamePlay.tCount > NUMERICAL.ZERO)
                ) {
                    msg = MESSAGES.ERROR.WILD_CARD_NOT_PICK;
                    opendDeck.unshift(pickOneCard[NUMERICAL.ZERO]);
                }
                else {
                    Logger.info(tableId,"pickOneCard :: ", pickOneCard);
                    let lastArrIndex = playerGamePlay.currentCards.length - 1;
                    playerGamePlay.currentCards[lastArrIndex].push(pickOneCard[NUMERICAL.ZERO]);

                    const result = playerGamePlay.currentCards.filter(ele => ele.length > NUMERICAL.ZERO);
                    playerGamePlay.currentCards = result;
                }

                const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
                    await manageAndUpdateData(playerGamePlay.currentCards, playerGamePlay)

                Logger.info(tableId,"playerGamePlayUpdated :: ", playerGamePlayUpdated.currentCards);
                playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
                playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
                playerGamePlay.cardPoints = totalScorePoint;
                playerGamePlay.lastPickCard = pickOneCard[NUMERICAL.ZERO];
                playerGamePlay.turnTimeOut = NUMERICAL.ZERO;
                playerGamePlay.pickFromDeck = CARDS_STATUS.OPEN_DECK;
                playerGamePlay.ispickCard = true;
                tableGamePlay.totalPickCount += NUMERICAL.ONE;

                const formatedPickCardData: pickCardFormOpenDackResponse =
                    await formatPickCardFormOpenDackData(
                        playerGamePlay.userId,
                        playerGamePlay.seatIndex,
                        tableId,
                        cards,
                        totalScorePoint,
                        msg,
                        pickOneCard[NUMERICAL.ZERO]
                    );
                Logger.info(tableId," formatedPickCardData :: ", formatedPickCardData);

                CommonEventEmitter.emit(EVENTS.PICK_FROM_OPEN_DECK_SOCKET_EVENT, {
                    socket: socketId,
                    tableId: tableId,
                    data: formatedPickCardData
                });

                await Promise.all([
                    playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
                    tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
                ])
            }
            return true;
        }
    }
    catch (error: any) {
        Logger.error(tableId,`pickCardFormOpenDackHandler Error :: ${error}`)

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
        } else if (error && error.type === ERROR_TYPE.USER_THROW_CARD_ERROR) {

            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket,
                data: {
                    isPopup: false,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
                    title: nonProdMsg,
                    message: error.message,
                    showTimer: false,
                }
            });

        } else {
            CommonEventEmitter.emit(EVENTS.PICK_FROM_OPEN_DECK_SOCKET_EVENT, {
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

export = pickCardFormOpenDackHandler;
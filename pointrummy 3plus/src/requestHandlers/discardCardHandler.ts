import Logger from "../logger";
import { discardCardFormator } from "../InputDataFormator";
import { discardCardInput, discardCardResponse } from "../interfaces/inputOutputDataFormator";
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache } from "../cache";
import { formatDiscardCardData } from "../formatResponseData";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes } from '../interfaces/signup';
import { EMPTY, ERROR_TYPE, EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../constants";
import manageAndUpdateData from "../utils/manageCardData";
import { manageAndUpdateDataInterface } from "../interfaces/manageAndUpdateData";
import Lock from "../lock"
import updateTurnHistory from "../services/turnHistory/updateTurnHistory";
import Errors from "../errors";
import { throwErrorIF } from "../interfaces/throwError";
import { cancelPlayerTurnTimer } from "../scheduler/cancelJob/playerTurnTimer.cancel";
import { cancelSeconderyTimer } from "../scheduler/cancelJob/seconderyTimer.cancel";
import { nextTurnDelay } from "../scheduler/queues/nextTurnDelay.queue";


async function discardCardHandler(socket: any, discardCardData: discardCardInput): Promise<boolean | errorRes | undefined> {
    const userId = String(discardCardData.userId) || socket.userId;
    const tableId = String(discardCardData.tableId) || socket.tableId;
    const socketId = socket.id;
    // const lock = await Lock.getLock().acquire([tableId], 2000);
    let lock:any = null;
    try {
        var userDiscardCard: string;
        var userDiscardCardGroupIndex: number;

        discardCardData.cards.map((ele) => {
            userDiscardCard = ele.card;
            userDiscardCardGroupIndex = ele.groupIndex;
        })

        const formatedDiscardCardHandlerData = await discardCardFormator(discardCardData);
        Logger.info(tableId," reqData : formatedDiscardCardHandlerData ===>> ", formatedDiscardCardHandlerData);

        lock = await Lock.getLock().acquire([`${tableId}`], 2000);


        const [playerGamePlay, tableGamePlay, tableConfig] = await Promise.all([
            playerGamePlayCache.getPlayerGamePlay(userId, tableId),
            tableGamePlayCache.getTableGamePlay(tableId),
            tableConfigCache.getTableConfig(tableId)
        ])

        if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');
        if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
        if (!tableConfig) throw new Errors.UnknownError('Unable to get table data');

        if (tableGamePlay.currentTurn !== userId) {
            const errorObj: throwErrorIF = {
                type: ERROR_TYPE.USER_THROW_CARD_ERROR,
                message: MESSAGES.ERROR.CURRENT_TURN_IS_NOT_YOUR_ERROR_MESSAGES,
                isToastPopup: true,
            };
            throw errorObj;
        }

        // if table state is winner or scoreboard tham this code not run
        if (tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED && tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD) {

            await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

            Logger.info(tableId," discardCard : playerGamePlay.currentCards.length ==>>", playerGamePlay.currentCards.length, " playerGamePlay.currentCards :: ", playerGamePlay.currentCards);
            const currentCards: string[] = [];
            playerGamePlay.currentCards.map((ele: string[]) => {
                ele.map((el: string) => { currentCards.push(el); })
            })

            if (currentCards.length == NUMERICAL.FOURTEEN) {

                let discardCard = <string[]>[];
                playerGamePlay.currentCards.map((cards: string[]) => {
                    cards.map((card: string, ind: number) => {
                        if (card == userDiscardCard) {
                            cards.splice(ind, NUMERICAL.ONE);
                            discardCard.push(card);
                        }
                    })
                })
                Logger.info(tableId,'discardCard :>> ', discardCard);
                Logger.info(tableId,"playerGamePlay.currentCards :>>", playerGamePlay.currentCards)

                const result = playerGamePlay.currentCards.filter(ele => ele.length > NUMERICAL.ZERO);
                playerGamePlay.currentCards = result;
                tableGamePlay.opendDeck.unshift(discardCard[NUMERICAL.ZERO])

                const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
                    await manageAndUpdateData(playerGamePlay.currentCards, playerGamePlay);

                await updateTurnHistory(
                    tableId,
                    discardCardData.currentRound,
                    discardCard[NUMERICAL.ZERO],
                    playerGamePlay,
                    false
                );

                playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
                playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
                playerGamePlay.cardPoints = totalScorePoint;
                playerGamePlay.cardPoints = totalScorePoint;
                playerGamePlay.pickFromDeck = EMPTY;
                playerGamePlay.pickFromDeck = EMPTY;
                playerGamePlay.tCount++;
                tableGamePlay.isSeconderyTimer = false;
                tableGamePlay.discardedCardsObj = [{
                    userId: userId,
                    card: discardCard[NUMERICAL.ZERO],
                    seatIndex: playerGamePlay.seatIndex
                }]

                await Promise.all([
                    playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
                    tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
                ])

                const formatedDiscardCardData: discardCardResponse =
                    await formatDiscardCardData(
                        playerGamePlay.userId,
                        playerGamePlay.seatIndex,
                        tableId,
                        cards,
                        totalScorePoint,
                        tableGamePlay.opendDeck
                    );
                Logger.info(tableId,"formatedDiscardCardData :: ", formatedDiscardCardData);

                CommonEventEmitter.emit(EVENTS.DISCARD_CARD_SOCKET_EVENT, {
                    tableId: tableId,
                    data: formatedDiscardCardData
                });

                await cancelPlayerTurnTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
                await cancelSeconderyTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
                await nextTurnDelay({
                    timer: NUMERICAL.ONE * NUMERICAL.ZERO,
                    jobId: `nextTurn:${tableId}:${NUMERICAL.ONE}`,
                    tableId,
                });

                return true;

            }
            else {
                Logger.error(tableId,`There is some error at discardCard request data for user ${userId}`);
                throw new Errors.UnknownError('some error at discardCard');
            }
        }
    }
    catch (error: any) {
        Logger.error(tableId,`discardCardHandler Error :: ${error}`);

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
                    tableId,
                }
            });

        } else {
            CommonEventEmitter.emit(EVENTS.DISCARD_CARD_SOCKET_EVENT, {
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
            Logger.error(tableId,error, ' signUpHandler ');
        }
    }
}

export = discardCardHandler;
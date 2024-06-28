import Logger from "../logger";
import { groupCardFormator } from "../InputDataFormator";
import { groupCardInput, groupCardResponse } from "../interfaces/inputOutputDataFormator";
import { playerGamePlayCache, tableGamePlayCache } from "../cache";
import { formatGroupCardData } from "../formatResponseData";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes } from '../interfaces/signup';
import { EVENTS, NUMERICAL, EMPTY, MESSAGES, TABLE_STATE } from "../constants";
import { manageAndUpdateDataInterface } from "../interfaces/manageAndUpdateData";
import manageAndUpdateData from "../utils/manageCardData";
import autoMakeGroup from "../utils/automakegroup";
import Errors from "../errors";
// import Lock from '../lock';

async function groupCardHandler(socket: any, groupCard: groupCardInput): Promise<boolean | errorRes | undefined> {
    const socketId = socket.id;
    const userId = String(groupCard.userId) || socket.userId;
    const tableId = String(groupCard.tableId) || socket.tableId;
    // let lock:any = null;
    // const lock = await Lock.getLock().acquire([`${userId}`], 2000);
    try {
        const userCards: any = [];
        const userCardsGroupIndex: any = [];
        groupCard.cards.map((ele) => {
            userCards.push(ele.card);
            userCardsGroupIndex.push(ele.groupIndex);
        })

        const formatedGroupCardHandlerData = await groupCardFormator(groupCard);
        Logger.info(tableId," reqData : formatedGroupCardHandlerData =====>> ", formatedGroupCardHandlerData);

        // lock = await Lock.getLock().acquire([`${userId}`], 2000);

        const [playerGamePlay, tableGamePlay] = await Promise.all([
            playerGamePlayCache.getPlayerGamePlay(userId, tableId),
            tableGamePlayCache.getTableGamePlay(tableId)
        ])

        if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');
        if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');

        Logger.info(tableId,"playerGamePlay.currentCards :: ", playerGamePlay.currentCards);
        // if table state is winner or scoreboard tham this code not run
        if (tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED && tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD) {
            let groupCheckArray = JSON.parse(JSON.stringify(playerGamePlay.currentCards));
            const newGroupCardsArr = [];
            // for (let i = 0; i < userCards.length; i++) {
            //     let indexfind = groupCheckArray[userCardsGroupIndex[i]].indexOf(userCards[i])
            //     if (indexfind != -1) {
            //         let newGroupcard = groupCheckArray[userCardsGroupIndex[i]].splice(indexfind, NUMERICAL.ONE);
            //         newGroupCardsArr.push(newGroupcard[NUMERICAL.ZERO]);
            //     }else{
            //         Logger.info(tableId,"groupCardHandler Card not found:: ",userId);
            //     }

            // }
            for (let i = 0; i < userCards.length; i++) {
                for (let j = 0; j < groupCheckArray.length; j++) {
                    const element = groupCheckArray[j];
                    let indexfind = element.indexOf(userCards[i]);


                    if (indexfind != -1) {
                        let newGroupcard = element.splice(indexfind, NUMERICAL.ONE);
                        newGroupCardsArr.push(newGroupcard[NUMERICAL.ZERO]);
                    }
                }
            }
            
            groupCheckArray.unshift(newGroupCardsArr);
            let isGroupMakesArr = await autoMakeGroup(groupCheckArray);
            let newGroupCheckArray: any = (typeof isGroupMakesArr == "boolean") ? groupCheckArray : isGroupMakesArr;
            Logger.info(tableId," newGroupCheckArray  :: =>> ", newGroupCheckArray);
            const result = newGroupCheckArray.filter((ele: any) => ele.length > NUMERICAL.ZERO);
            Logger.info(tableId," groupCheckArray :: =>>", result);

            let msg: string = EMPTY;
            let currentCardToSend = <Array<Array<string>>>[];
            if (result.length <= NUMERICAL.SIX) {
                currentCardToSend = result;
            } else {
                currentCardToSend = playerGamePlay.currentCards;
                msg = MESSAGES.ERROR.NOT_CREATE_MORE_THEN_SIX_GROUP;
            }
            Logger.info(tableId," playerGamePlay.currentCards send to unity :: ", currentCardToSend);

            const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
                await manageAndUpdateData(currentCardToSend, playerGamePlay)

            playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
            playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
            playerGamePlay.cardPoints = totalScorePoint;

            await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

            const formatedGroupCardData: groupCardResponse =
                await formatGroupCardData(
                    playerGamePlay.userId,
                    tableId,
                    cards,
                    totalScorePoint,
                    msg
                );
            Logger.info(tableId,"formatedCardGroupsData :: ", formatedGroupCardData);

            CommonEventEmitter.emit(EVENTS.GROUP_CARD_SOCKET_EVENT, {
                socket: socketId,
                tableId: tableId,
                data: formatedGroupCardData
            });
            return true;
        }

    }
    catch (error: any) {
        Logger.error(tableId,`groupCardHandler Error :: ${error}`)

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
            CommonEventEmitter.emit(EVENTS.GROUP_CARD_SOCKET_EVENT, {
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
            // if (lock) await Lock.getLock().release(lock);
        } catch (error) {
            Logger.error(tableId,error, ' leaveTable ');
        }
    }
}

export = groupCardHandler;


import Logger from "../logger";
import { lastDealFormator } from "../InputDataFormator";
import { lastDealInput } from "../interfaces/inputOutputDataFormator";
import { lastDealCache } from "../cache";
import { formatLastDealData } from "../formatResponseData";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes } from '../interfaces/signup';
import { EVENTS, MESSAGES, NUMERICAL } from "../constants";
import Errors from "../errors";
import Lock from '../lock';


async function lastDealHandler(socket: any, lastDealData: lastDealInput): Promise<boolean | errorRes | undefined> {
    const socketId = socket.id;
    const userId = String(lastDealData.userId) || socket.userId;
    const tableId = String(lastDealData.tableId) || socket.tableId;
    // const lock = await Lock.getLock().acquire([`${tableId}`], 2000);
    let lock:any = null;
    try {

        const formatedlastDealData = await lastDealFormator(lastDealData);
        Logger.info(" reqData : formatedlastDealData ===>> ", formatedlastDealData);

        lock = await Lock.getLock().acquire([`${userId}`], 2000);

        const lastDeal = await lastDealCache.getLastDeal(userId);
        if (!lastDeal) {

            let nonProdMsg = "Last Deal Not Found";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
                    title: nonProdMsg,
                    message: MESSAGES.ERROR.LAST_DEAL_NOT_FOUND,
                    showTimer : false,
                    tableId,
                },
            });
           
        }
        else {

            let formatedLastDealResponse = await formatLastDealData(lastDeal);
            Logger.info("formatedLastDealResponse :: >> ", formatedLastDealResponse);
            CommonEventEmitter.emit(EVENTS.LAST_DEAL_SOCKET_EVENT, {
                socket: socketId,
                tableId: tableId,
                data: formatedLastDealResponse
            });
        }

        return true;
    }
    catch (error: any) {
        Logger.error(`lastDealHandler Error :: ${error}`)

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
        } else {
            CommonEventEmitter.emit(EVENTS.LAST_DEAL_SOCKET_EVENT, {
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
            Logger.error(error, ' leaveTable ');
        }
    }
}

export = lastDealHandler;


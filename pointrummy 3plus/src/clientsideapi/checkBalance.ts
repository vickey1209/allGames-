import axios from "axios";
import Errors from "../errors";
import CommonEventEmitter from "../commonEventEmitter";
import { checkBalanceIf } from '../interfaces/cmgApiIf'
import { getConfig } from "../config";
import { EVENTS, MESSAGES, NUMERICAL } from "../constants";
const { CHECK_BALANCE, APP_KEY, APP_DATA } = getConfig();
import Logger from "../logger";

async function checkBalance(data: checkBalanceIf, token: string, socketId: string, userId: string) {
    Logger.info(userId,"checkBalance ", data, token);
    return {userBalance:{isInsufficiantBalance:false}}
    try {

        const url = CHECK_BALANCE;
        Logger.info(userId,"checkBalance url :: ", url);
        Logger.info(userId,"APP_KEY : ", APP_KEY, "APP_DATA : ", APP_DATA);
        let responce = await axios.post(url, data, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key': APP_KEY, 'x-mgpapp-data': APP_DATA } })
        // Logger.info("resData : checkBalance responce :: ", responce.data);

        let checkBalanceDetail = responce.data.data;
        Logger.info(userId,"resData : checkBalanceDetail :: ", checkBalanceDetail);

        if (!responce || !responce.data.success || !checkBalanceDetail) {
            throw new Errors.InvalidInput('Unable to fetch checkBalance data');
        }
        if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
            Logger.info(userId,`Server under the maintenance.`)
            throw new Errors.UnknownError('Unable to fetch checkBalance data');
        }
        return checkBalanceDetail;

    } catch (error: any) {
        Logger.error(userId,'CATCH_ERROR :  checkBalance :>> ', data, token, "-", error);

        if (error instanceof Errors.UnknownError) {
            let nonProdMsg = "Server under the maintenance!";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        }
        else if (error?.response && error?.response?.data && !error?.response?.data?.success) {
            let nonProdMsg = "Fetch data failed!";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: error.response.data.message ? error.response.data.message : MESSAGES.ERROR.COMMON_ERROR,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        }
        else {
            let nonProdMsg = "Fetch data failed!";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: MESSAGES.ERROR.COMMON_ERROR,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        }
       throw error;
    }
}

const exportedObj = {
    checkBalance,
};

export = exportedObj;
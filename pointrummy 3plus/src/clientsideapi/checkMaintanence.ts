import axios from "axios";
import Errors from "../errors";
import CommonEventEmitter from "../commonEventEmitter";
import { getConfig } from "../config";
import { EVENTS, MESSAGES, NUMERICAL } from "../constants";
const { CHECK_MAINTANENCE, APP_KEY, APP_DATA } = getConfig();
import Logger from "../logger";


async function checkMaintanence(token: string, socketId: string,userId: string) {
    Logger.info(userId,"checkMaintanence ::=>> ", token);
    return {isMaintenance:false}

    try {
        const url = CHECK_MAINTANENCE;
        Logger.info(userId,"checkMaintanence url :: ", url);
        Logger.info(userId,"APP_KEY : ", APP_KEY, "APP_DATA : ", APP_DATA, "token ::>>", token);
        let responce = await axios.post(CHECK_MAINTANENCE, {}, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key': APP_KEY, 'x-mgpapp-data': APP_DATA } })
        // Logger.info("resData : checkMaintanence log :: ", responce.data.data);
        Logger.info(userId,"resData : checkMaintanence responce :: ", responce.data);

        let checkMaintanenceDetail = responce.data.data;
        Logger.info(userId,"resData : checkMaintanenceDetail :: ", checkMaintanenceDetail);

        if (!responce || !responce.data.success || !checkMaintanenceDetail) {
            throw new Errors.InvalidInput('Unable to fetch checkMaintanence data');
        }

        if(checkMaintanenceDetail && checkMaintanenceDetail.isMaintenance){
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
        return checkMaintanenceDetail;

    } catch (error: any) {
        Logger.error(userId,'CATCH_ERROR :  checkMaintanence :>> ', token, "-", error);

        if (error?.response && error?.response?.data && !error?.response?.data?.success) {
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
    checkMaintanence,
};

export = exportedObj;
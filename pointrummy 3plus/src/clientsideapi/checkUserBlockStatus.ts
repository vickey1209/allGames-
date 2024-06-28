import axios from "axios";
import { getConfig } from "../config";
import CommonEventEmitter from "../commonEventEmitter";
import Errors from "../errors";
import { EVENTS, MESSAGES, NUMERICAL } from "../constants";
const { CHECK_USER_BLOCK_STATUS, APP_KEY, APP_DATA } = getConfig();
import Logger from "../logger";


async function checkUserBlockStatus(tablePlayerIds: string[], token: string, socketId: string, tableId: string): Promise<any> {

    Logger.info(tableId,"checkUserBlockStatus :: ", tablePlayerIds, token);
    return false;

    try {
        const url = CHECK_USER_BLOCK_STATUS;
        Logger.info(tableId,"checkUserBlockStatus :: url :", url);

        const responce = await axios.post(url, { tablePlayerIds }, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key':APP_KEY, 'x-mgpapp-data':APP_DATA } })
        // Logger.info("checkUserBlockStatus : responce :: ", responce.data);

        const checkUserBlockStatusData = responce.data.data
        Logger.info(tableId,"resData : checkUserBlockStatus :: ", checkUserBlockStatusData);

        if (!responce || !responce.data.success || !checkUserBlockStatusData) {
            throw new Errors.InvalidInput('Unable to fetch checkUserBlockStatus data');
        }
        if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
            Logger.info(tableId,`Server under the maintenance.`)
            throw new Errors.UnknownError('Unable to fetch checkUserBlockStatus data');
        }
        return checkUserBlockStatusData.isUserBlock;

    } catch (error : any) {
        Logger.error(tableId,'CATCH_ERROR : checkUserBlockStatus :>> ', error, "-", tablePlayerIds, token);

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
        else{
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
    checkUserBlockStatus,
};

export = exportedObj;
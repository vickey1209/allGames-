import axios from "axios";
import { getConfig } from "../config";
import { markCompletedGameStatusIf } from '../interfaces/cmgApiIf'
import CommonEventEmitter from "../commonEventEmitter";
import Errors from "../errors";
import { EVENTS, MESSAGES, NUMERICAL } from "../constants";
const { MARK_COMPLETED_GAME_STATUS, APP_KEY, APP_DATA } = getConfig();
import Logger from "../logger";


async function markCompletedGameStatus(data: markCompletedGameStatusIf, token: string, socketId: string): Promise<any> {
    const tableId = data.tableId;
    Logger.info(tableId,"markCompletedGameStatus :: ", data, token);
    return true;

    try {
        const url = MARK_COMPLETED_GAME_STATUS;
        Logger.info(tableId,"markCompletedGameStatus :: url :", url);

        //only one game finished
        // const responce = await axios.post(url, data, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key':APP_KEY, 'x-mgpapp-data':APP_DATA } })

        //all game finished
        const responce = await axios.post(url, {gameId : data.gameId}, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key':APP_KEY, 'x-mgpapp-data':APP_DATA } })
        Logger.info(tableId,"markCompletedGameStatus : responce :: ", responce.data);

        if (!responce || !responce.data.success) {
            throw new Errors.InvalidInput('Unable to fetch markCompletedGameStatus data');
        }
        if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
            Logger.info(tableId,`Server under the maintenance.`)
            throw new Errors.UnknownError('Unable to fetch markCompletedGameStatus data');
        }
        return responce;

    } catch (error: any) {
        Logger.error(tableId,'CATCH_ERROR : markCompletedGameStatus :>> ', error, "-", data, token);

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
    markCompletedGameStatus,
};

export = exportedObj;
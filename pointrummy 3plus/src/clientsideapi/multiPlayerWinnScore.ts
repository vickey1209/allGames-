import axios from "axios";
import { getConfig } from "../config";
import { multiPlayerWinnScoreIf } from '../interfaces/cmgApiIf'
import CommonEventEmitter from "../commonEventEmitter";
import Errors from "../errors";
import { EVENTS, MESSAGES, NUMERICAL } from "../constants";
const { MULTI_PLAYER_SUBMIT_SCORE, APP_KEY, APP_DATA } = getConfig(); 
import Logger from "../logger";


async function multiPlayerWinnScore(data: multiPlayerWinnScoreIf, token: string, socketId: string) {
    const tableId = data.tableId;
    Logger.info(tableId,"4multiPlayerWinnScore :: ", data, token)
    return true

    try {

        const url = MULTI_PLAYER_SUBMIT_SCORE;

        const responce = await axios.post(url, data, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key':APP_KEY, 'x-mgpapp-data':APP_DATA } })
        // Logger.info("multiPlayerWinnScore : responce :: ", responce.data);

        const multiPlayerSubmitScoreData = responce.data.data
        Logger.info(tableId,"resData : multiPlayerSubmitScore :: ", multiPlayerSubmitScoreData);

        if (!responce || !responce.data.success || !multiPlayerSubmitScoreData) {
            throw new Errors.InvalidInput('Unable to fetch multiPlayerSubmitScoreData data');
        }
        if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
            Logger.info(tableId,`Server under the maintenance.`)
            throw new Errors.UnknownError('Unable to fetch multiPlayerSubmitScoreData data');
        }

        return multiPlayerSubmitScoreData;

    } catch (error : any) {
        Logger.error(tableId,'CATCH_ERROR : multi Player Winn Score:  :>> ', error, "-", data, token);

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
          return true;

    }


}

const exportedObj = {
    multiPlayerWinnScore,
};

export = exportedObj;
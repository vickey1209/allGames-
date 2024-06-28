import axios from "axios";
import { getConfig } from "../config";
import Errors from "../errors";
import { MESSAGES } from '../constants';
const { GAME_SETTING_MENU_HELP, APP_KEY, APP_DATA } = getConfig();
import Logger from "../logger";


async function gameSettinghelp(gameId: any, token: string, socketId: string, tableId: string) {
    Logger.error(tableId,"gmaneSettinghelp : :  ", gameId, token)
    return true;

    try {
        const url = GAME_SETTING_MENU_HELP

        const responce = await axios.post(url, { gameId }, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key':APP_KEY, 'x-mgpapp-data':APP_DATA } });
        // Logger.info("resData gmaneSettinghelp : : >> ", responce.data);

        const rules = responce.data.data;
        Logger.info(tableId,"resData : gameSettinghelp rules :: ", rules);

        if (!responce || !responce.data.success || !rules) {
            throw new Errors.InvalidInput('Unable to fetch gmaneSettinghelp data');
        }
        if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
            Logger.info(tableId,`Server under the maintenance.`)
            throw new Errors.UnknownError('Unable to fetch gmaneSettinghelp data');
        }
        return rules;

    } catch (error : any) {
        Logger.error(tableId,'CATCH_ERROR : gmaneSettinghelp :: ', gameId, token, " - ", error);

        // if (error instanceof Errors.UnknownError) {
        //     let nonProdMsg = "Server under the maintenance!";
        //     CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        //         socket: socketId,
        //         data: {
        //             isPopup: true,
        //             popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
        //             title: nonProdMsg,
        //             message: MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE,
        //             buttonCounts: NUMERICAL.ONE,
        //             button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
        //             button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
        //             button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        //         },
        //     });
        // }
        // else if (error?.response && error?.response?.data && !error?.response?.data?.success) {
        //     let nonProdMsg = "Fetch data failed!";
        //     CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        //         socket: socketId,
        //         data: {
        //             isPopup: true,
        //             popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
        //             title: nonProdMsg,
        //             message: error.response.data.message ? error.response.data.message : MESSAGES.ERROR.COMMON_ERROR,
        //             buttonCounts: NUMERICAL.ONE,
        //             button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
        //             button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
        //             button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        //         },
        //     });
        // }
        // else{
        //     let nonProdMsg = "Fetch data failed!";
        //     CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        //         socket: socketId,
        //         data: {
        //           isPopup: true,
        //           popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
        //           title: nonProdMsg,
        //           message: MESSAGES.ERROR.COMMON_ERROR,
        //           buttonCounts: NUMERICAL.ONE,
        //           button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
        //           button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
        //           button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        //         },
        //       });
        // } 
        return true;

    }

}

const exportedObj = {
    gameSettinghelp,
};

export = exportedObj; 
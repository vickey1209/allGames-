import axios from "axios";
import { getConfig } from "../config";
import Errors from "../errors";
import { MESSAGES } from "../constants";
const { GET_ONE_ROBOT, APP_KEY, APP_DATA } = getConfig();
import Logger from "../logger";

async function getOneRobot(tournamentId: string, token: string, tableId: string) {
    Logger.info(tableId,"getOneRobot :: ", tournamentId, token)
    try {

        const url = GET_ONE_ROBOT;
        let responce = await axios.post(url, { tournamentId }, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key':APP_KEY, 'x-mgpapp-data':APP_DATA } });
        // Logger.info("getOneRobot : responce :: ", responce.data);

        let getOneRobotDetail = responce.data;
        Logger.info(tableId,"resData : getOneRobotDetail :: ", getOneRobotDetail);

        if (!responce || !responce.data.success || !getOneRobotDetail) {
            throw new Errors.InvalidInput('Unable to fetch robot data');
        }
        else if (getOneRobotDetail.data.isBotAvailable === false) {
            throw new Errors.InvalidInput("isBotAvailable false");
        }
        if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
            Logger.info(tableId,`Server under the maintenance.`)
            throw new Errors.UnknownError('Unable find user profile failed!');
        }

        return getOneRobotDetail.data.botDetails;

    } catch (error : any) {

        Logger.error(tableId,'CATCH_ERROR :  getOneRobot :>> ', tournamentId, token, "-", error);

        // if (error instanceof Errors.UnknownError) {
        //     let nonProdMsg = "Server under the maintenance!";
        //     CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        //         socket: socketId,
        //         data: {
        //             isPopup: true,
                    // popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
        //             title: nonProdMsg,
        //             message: MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE,
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
                //   popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
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
    getOneRobot,
};

export = exportedObj;
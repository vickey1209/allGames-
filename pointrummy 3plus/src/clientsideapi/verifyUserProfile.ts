import axios from "axios";
import CommonEventEmitter from "../commonEventEmitter";
import Errors from "../errors";
import { getConfig } from "../config";
import { EVENTS, MESSAGES, NUMERICAL } from '../constants';
const { VERIFY_USER_PROFILE, APP_KEY, APP_DATA } = getConfig();
import Logger from "../logger";

async function verifyUserProfile(token: string, gameId :string,  socketId: string, userId: string): Promise<any> {
  Logger.info(userId,"verifyUserProfile :: ", token, "gameId :: >", gameId);
  return true;

  let result : any;
  try {
    const url = VERIFY_USER_PROFILE;
    Logger.info(userId,"url ::", url, "APP_KEY :: ", APP_KEY, "APP_DATA :: ", APP_DATA)
    let responce = await axios.post(url, {gameId : gameId}, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key': APP_KEY, 'x-mgpapp-data': APP_DATA } });
    Logger.info(userId,"verifyUserProfile : responce :: ", responce.data);

    result = responce.data.data;
    Logger.info(userId,"resData : result :: ", result);

    if (!responce || !result) {
      throw new Error('Unable to fetch verify User Profile data');
    }
    if (result.isValidUser === false) {
      Logger.info(userId,"isValidUser  =====>>>> ", result.isValidUser)
      throw new Errors.InvalidInput('Unable to fetch verify User Profile data');
    }
    if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
      Logger.info(userId,`Server under the maintenance.`)
      throw new Errors.UnknownError('Unable to fetch verify User Profile data');
    }
    return result;
  } catch (error: any) {
    Logger.error(userId,"CATCH_ERROR : getUserProfile :: ", token, '-', error);
    console.log('error :==>> ', error);
    
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
    else if (error instanceof Errors.InvalidInput) {

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
  verifyUserProfile,
};
export = exportedObj;

import axios from "axios";
import { getConfig } from "../config";
import CommonEventEmitter from "../commonEventEmitter";
import Errors from "../errors";
import { EVENTS, MESSAGES, NUMERICAL } from '../constants';
const { GET_USER_OWN_PROFILE, APP_KEY, APP_DATA } = getConfig();
import Logger from "../logger";


async function getUserOwnProfile(token: string, socketId: string, userId: string): Promise<any> {
  Logger.info(userId,"getUserOwnProfile :: ", token)
  return {coins:1000,winCash :1000,cash:1000}

  try {

    const url = GET_USER_OWN_PROFILE
    Logger.info(userId,"getUserOwnProfile url :: ", url)

    const responce = await axios.post(url, {}, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key': APP_KEY, 'x-mgpapp-data': APP_DATA } });
    // Logger.info("getUserOwnProfile : responce :: ", responce.data);

    const userProfileDetail = responce.data.data
    Logger.info(userId,"resData : userProfileDetail :: ", userProfileDetail);

    if (!responce || !responce.data.success || !userProfileDetail) {
      throw new Errors.InvalidInput('Unable find user profile failed!');
    }
    if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
      Logger.info(userId,`Server under the maintenance.`)
      throw new Errors.UnknownError('Unable find user profile failed!');
    }
    return userProfileDetail;

  } catch (error: any) {
    Logger.error(userId,"CARCH_ERROR: getUserOwnProfile ::", token, "-", error);
    
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
      Logger.info("CARCH_ERROR: ERR>:", error.response.data);
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
    throw new Error("get User Own Profile");

  }
}

const exportedObj = {
  getUserOwnProfile,
};

export = exportedObj;

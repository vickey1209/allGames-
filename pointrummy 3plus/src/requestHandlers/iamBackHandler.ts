import Logger from "../logger";
import { EMPTY, EVENTS, MESSAGES, NUMERICAL } from '../constants';
import { iamBackInputInterface } from '../interfaces/iAmBack';
import { successRes } from '../interfaces/signup';
import { tableConfigCache, userProfileCache } from '../cache';
import { iamBack } from '../services/rejoinFromPopup';
import CommonEventEmitter from '../commonEventEmitter';
import { iAmBackFormator } from '../InputDataFormator';
import Errors from "../errors";
import Lock from "../lock";
import { cancelRejoinTimer } from "../scheduler/cancelJob/rejoinTimer.cancel";

async function iamBackHandler(
  socket: any,
  iamBackInput: iamBackInputInterface
  ): Promise<successRes | undefined> {
  const userId = iamBackInput.userId;
  const socketId = socket.id;
  const lock = await Lock.getLock().acquire([iamBackInput.tableId], 2000);
  try {
    Logger.info(" <= iamBackHandler : call =>");

    const formatiamBackData = await iAmBackFormator(iamBackInput);
    Logger.info(" reqData : formatiamBackData =====>> ", formatiamBackData);

    const { userId, tableId } = formatiamBackData;
    const userProfile = await userProfileCache.getUserProfile(userId);

    if (!userProfile) throw new Errors.UnknownError('user not found!');

    if (tableId === EMPTY) {
      Logger.info(tableId," iamBackHandler ::: >> tableId EMPTY");
      CommonEventEmitter.emit(EVENTS.RECONNECTION_SOCKET_EVENT, {
        socketId: socketId,
        data: {},
        tableId
      });

      userProfile.tableIds = userProfile.tableIds.filter((el) => tableId != el);
      userProfile.tableId = userProfile.tableIds.length === 0 ? EMPTY : userProfile.tableIds[NUMERICAL.ZERO];
      Logger.info(tableId," iamBackHandler ::: >> userProfile.tableId", userProfile.tableId, "userProfile.tableIds :: >> ", userProfile.tableIds);
      await userProfileCache.setUserProfile(userId, userProfile);
      return { success: true, error: null };
    }

    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) throw new Errors.UnknownError('tableConfig not found !');

    await iamBack(formatiamBackData, tableConfig.currentRound, socket);
    await cancelRejoinTimer(`rejoinTimer:${tableId}:${userId}:${NUMERICAL.ONE}`, tableId);

    return { success: true, error: null, tableId };

  } catch (error: any) {
    Logger.error(
      error,
      ` table ${iamBackInput && iamBackInput.tableId}  user ${socket && socket.userId
      } function iamBackHandler`
    );

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
          tableId : iamBackInput.tableId,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else if (error instanceof Errors.UnknownError) {
      nonProdMsg = "FAILED";

      CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: msg,
          tableId : iamBackInput.tableId,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else {
      CommonEventEmitter.emit(EVENTS.REJOIN_I_AM_BACK_SOCKET_EVENT, {
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

  }finally{
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(error, ' leaveTable ');
    }
  }
}

export = iamBackHandler;

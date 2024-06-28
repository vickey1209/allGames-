import Logger from "../logger";
import { openDeckCardsFormator } from "../InputDataFormator";
import { openDeckCardsInput, openDeckCardsResponse } from "../interfaces/inputOutputDataFormator";
import { tableGamePlayCache } from "../cache";
import { formatOpenDeckCardsData } from "../formatResponseData";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes } from '../interfaces/signup';
import { EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../constants";
import Errors from "../errors";
import Lock from '../lock';




async function openDeckCardsHandler(socket: any, openDeckCards: openDeckCardsInput): Promise<boolean | errorRes | undefined> {
  const socketId = socket.id;
  const userId = String(openDeckCards.userId) || socket.userId;
  const tableId = String(openDeckCards.tableId) || socket.tableId;
  // const lock = await Lock.getLock().acquire([`${userId}`], 2000);
  let lock :any = null;
  try {

    const formatedOpenDeckCardsData = await openDeckCardsFormator(openDeckCards);
    Logger.info(tableId," reqData : formatedOpenDeckCardsData =====>> ", formatedOpenDeckCardsData);

    lock = await Lock.getLock().acquire([`${userId}`], 2000);

    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId)
    if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
    
    // if table state is winner or scoreboard tham this code not run
    if (tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED && tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD) {
      const opendDeck: string[] = tableGamePlay.opendDeck;
      const formatedOpenDeckCardsResData: openDeckCardsResponse =
        await formatOpenDeckCardsData(
          userId,
          tableId,
          opendDeck
        );
      Logger.info(tableId,"formatedOpenDeckCardsData :: ", formatedOpenDeckCardsData);

      CommonEventEmitter.emit(EVENTS.SHOW_OPENDECK_CARDS_EVENT, {
        socket: socketId,
        tableId: tableId,
        data: formatedOpenDeckCardsResData
      });

      return true;
    }
  }
  catch (error: any) {
    Logger.error(tableId,`openDeckCardsHandler Error :: ${error}`)

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
          tableId,
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
          tableId,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else {
      CommonEventEmitter.emit(EVENTS.SHOW_OPENDECK_CARDS_EVENT, {
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
  }
  finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId,error, ' leaveTable ');
    }
  }
}

export = openDeckCardsHandler;



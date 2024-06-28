import Logger from "../logger";
import { saveCardsInSortsFormator } from "../InputDataFormator";
import { saveCardsInSortsInput } from "../interfaces/inputOutputDataFormator";
import { playerGamePlayCache, tableGamePlayCache } from "../cache";
import { CardSortsResponse } from "../interfaces/inputOutputDataFormator";
import { formatCardSortsData } from "../formatResponseData";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes } from '../interfaces/signup';
import { EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../constants";
import { cardGroups, sortCard } from "../utils/cardLogic";
import { manageAndUpdateDataInterface } from "../interfaces/manageAndUpdateData";
import manageAndUpdateData from "../utils/manageCardData";
import autoMakeGroup from "../utils/automakegroup";
import Errors from "../errors";
import Lock from '../lock';

async function saveCardsInSortsHandler(socket: any, saveCards: saveCardsInSortsInput): Promise<boolean | errorRes | undefined> {

  const socketId = socket.id;
  const userId = String(saveCards.userId) || socket.userId;
  const tableId = String(saveCards.tableId) || socket.tableId;
  // const lock = await Lock.getLock().acquire([`${userId}`], 2000);
  let lock:any = null;
  try {

    const formatedsaveCardsInSortsData = await saveCardsInSortsFormator(saveCards);
    Logger.info(tableId," reqData : formatedsaveCardsInSortsData ====>> ", formatedsaveCardsInSortsData);

    lock = await Lock.getLock().acquire([`${userId}`], 2000);

    const [playerGamePlay, tableGamePlay] = await Promise.all([
      playerGamePlayCache.getPlayerGamePlay(userId, tableId),
      tableGamePlayCache.getTableGamePlay(tableId)
    ])
    if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');
    if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
    // if table state is winner or scoreboard tham this code not run
    if (tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED && tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD) {
      let newCardArr = [];
      for (let i = 0; i < playerGamePlay.currentCards.length; i++) {
        newCardArr.push(...playerGamePlay.currentCards[i]);
      }
      const Groups: string[][] = await cardGroups(newCardArr);
      const allPromise: any[] = [];
      for (let i = 0; i < Groups.length; i++) {
        const ele = Groups[i];
        allPromise.push(sortCard(ele));
      }
      const allPromiseSorts = await Promise.all(allPromise);

      let isGroupMakesArr = await autoMakeGroup(allPromiseSorts);
      let newGroupCheckArray: any = (typeof isGroupMakesArr == "boolean") ? allPromiseSorts : isGroupMakesArr;
      Logger.info(tableId,"newGroupCheckArray :: ==>> ", newGroupCheckArray);
      const result = newGroupCheckArray.filter((ele: any) => ele.length > NUMERICAL.ZERO);
      Logger.info(tableId,"<<=== result ===>>", result);

      const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
        await manageAndUpdateData(result, playerGamePlay)

      // Logger.info("=====playerGamePlayUpdated===", playerGamePlayUpdated.currentCards);
      playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
      playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
      playerGamePlay.cardPoints = totalScorePoint;

      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

      const formatedCardSortsData: CardSortsResponse =
        await formatCardSortsData(
          playerGamePlay.userId,
          tableId,
          cards,
          totalScorePoint
        );
      Logger.info(tableId," formatedCardGroupsData :: ", formatedCardSortsData);

      CommonEventEmitter.emit(EVENTS.SAVE_CARDS_IN_SORTS_SOCKET_EVENT, {
        socket: socketId,
        tableId: tableId,
        data: formatedCardSortsData
      });
      return true;
    }
  }
  catch (error: any) {
    Logger.error(tableId,`saveCardsInSortsHandler Error :: ${error}`)

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
      CommonEventEmitter.emit(EVENTS.SAVE_CARDS_IN_SORTS_SOCKET_EVENT, {
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

export = saveCardsInSortsHandler;


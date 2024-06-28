import Logger from "../logger";
import { endDragCardFormator } from "../InputDataFormator";
import { endDragCardInput, endDragCardResponse } from "../interfaces/inputOutputDataFormator";
import { playerGamePlayCache } from "../cache";
import { formatEndDragCardData } from "../formatResponseData";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes } from '../interfaces/signup';
import { EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../constants";
import { manageAndUpdateDataInterface } from "../interfaces/manageAndUpdateData";
import manageAndUpdateData from "../utils/manageCardData";
import Errors from "../errors";
import Lock from '../lock';
import { getTableGamePlay } from "../cache/tableGamePlay";


async function endDragCardHandler(socket: any, endDragCard: endDragCardInput): Promise<boolean | errorRes | undefined> {
  const socketId = socket.id;
  const userId = String(endDragCard.userId) || socket.userId;
  const tableId = String(endDragCard.tableId) || socket.tableId;
  // const lock = await Lock.getLock().acquire([`${userId}`], 2000);
  let lock : any = null;
  try {
    var userCard: any;
    var userGroupIndex: any;
    var destinationGroupIndex: number = endDragCard.destinationGroupIndex
    var cardIndexInGroup: number = endDragCard.cardIndexInGroup;
    endDragCard.cards.map((ele) => {
      userCard = ele.card;
      userGroupIndex = ele.groupIndex;
    })

    lock = await Lock.getLock().acquire([`${userId}`], 2000);
    
    const tableGamePlay = await getTableGamePlay(tableId)
    if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
    
    // if table state is winner or scoreboard tham this code not run
    if (tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED && tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD) {
      const formatedEndDragCardHandlerData = await endDragCardFormator(endDragCard);
      Logger.info(tableId," reqData : formatedEndDragCardHandlerData ===>> ", formatedEndDragCardHandlerData);

      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(userId, tableId);
      if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');

      let indexfind = playerGamePlay.currentCards[userGroupIndex].indexOf(userCard);
      if (indexfind != -1) {
        let spliceCard = playerGamePlay.currentCards[userGroupIndex].splice(indexfind, NUMERICAL.ONE);
        playerGamePlay.currentCards[destinationGroupIndex].splice(cardIndexInGroup, NUMERICAL.ZERO, spliceCard[NUMERICAL.ZERO]);
      }

      const result = playerGamePlay.currentCards.filter(ele => ele.length > NUMERICAL.ZERO);
      playerGamePlay.currentCards = result;

      const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
        await manageAndUpdateData(playerGamePlay.currentCards, playerGamePlay)

      playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
      playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
      playerGamePlay.cardPoints = totalScorePoint;

      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

      const formatedEndDragCardData: endDragCardResponse =
        await formatEndDragCardData(
          playerGamePlay.userId,
          tableId,
          cards,
          totalScorePoint
        );
      Logger.info(tableId,"formatedEndDragCardData :: ", formatedEndDragCardData);

      CommonEventEmitter.emit(EVENTS.END_DRAG_SOCKET_EVENT, {
        socket: socketId,
        tableId: tableId,
        data: formatedEndDragCardData
      });
      return true;
    }

  }
  catch (error: any) {
    Logger.error(tableId,`endDragCardHandler Error :: ${error}`);

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
      CommonEventEmitter.emit(EVENTS.END_DRAG_SOCKET_EVENT, {
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

export = endDragCardHandler;
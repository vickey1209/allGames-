import CommonEventEmitter from '../commonEventEmitter';
import { EMPTY, EVENTS, EVENT_EMITTER, NUMERICAL, TABLE_STATE } from '../constants';
import { roundTimerExpired } from "../services/round";
import { changeTurn, onTurnExpire, startUserTurn } from "../services/turn";
import { roundDealerSetTimer, cardDealingTimer, tossCardTimer } from "../services/initializeRound";
import {
  DACLARE_PLAYER_TURN_TIMER_EXPIRED,
  LOCK_IN_PERIOD_EXPIRED,
  NEXT_TURN_DELAY,
  PLAYER_REJOIN_TIMER_EXPIRED,
  ROBOT_SEATNG_IN_TABLE_EXPIRED,
  ROUND_TIMER_START_TIMER_EXPIED,
  START_USER_TURN,
  TOSS_CARD_EXPIRED,
  WAITING_FOR_PLAYER_TIMER_EXPIRED
} from "../constants/eventEmitter";
import {
  addClientInRoom,
  sendEventToRoom,
  sendEventToClient,
  leaveClientInRoom
} from '../socket';
import { BOOT_COLLECTING_START_TIMER_EXPIRED, CARD_DEALING_TIMER_EXPIRED, PLAYER_TURN_TIMER_EXPIRED } from '../constants/eventEmitter';
import declareHandler from '../requestHandlers/declareHandler';
import leaveTableHandler from '../requestHandlers/leaveTableHandler';
import Logger from "../logger";
import roundStartTimer from '../services/round/roundStartTimer';
import { responseData } from "../interfaces/responseData";
import expireScoreBoardShow from '../services/scoreBoard/expireScoreBoardShow';
import nextRound from '../services/nextRound';
import seconderyTimer from '../services/turn/secondryTimer';
import { tableGamePlayCache } from '../cache';
import { defaultTableGamePlayInterface } from '../interfaces/tableGamePlay';
import { lockTimerStart } from '../scheduler/queues/lockTimerStart.queue';

function heartBeatEvent(payload: any) {
  const { socketId, data } = payload;
  let tableId = EMPTY;
  const responseData: responseData = {
    eventName: EVENTS.HEART_BEAT_SOCKET_EVENT,
    data
  };
  sendEventToClient(socketId, responseData, tableId);
}

function joinTableEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData: responseData = {
    eventName: EVENTS.JOIN_TABLE_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

async function addPlayerInTable(payload: any) {
  const { socketId, data } = payload;
  const { tableId, userId } = data;
  await addClientInRoom(socketId, tableId, userId);
}

function singUpCompleteEvent(payload: any) {

  const { socketId, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.SIGN_UP_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socketId, responseData, tableId);
}

function waitingTimerStart(payload: any) {
  const { tableId, data } = payload;
  const responseData: responseData = {
    eventName: EVENTS.WAITING_TIMER_START,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}


function gameCountDownEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData: responseData = {
    eventName: EVENTS.GAME_COUNT_DOWN,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function lockInPeriodEvent(payload: any) {
  const { tableId, data, socket } = payload;
  const responseData: responseData = {
    eventName: EVENTS.LOCK_IN_PERIOD_SOCKET_EVENT,
    data
  };
  if (socket) {
    Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
    sendEventToClient(socket, responseData, tableId);
  } else {
    Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
    sendEventToRoom(tableId, responseData);
  }
}

function tossCardEvent(payload: any) {
  const { tableId, socket, data } = payload;
  const responseData: responseData = {
    eventName: EVENTS.TOSS_CARD_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
  // sendEventToRoom(tableId, responseData);
}


function bootColletEvent(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function dealerPlayerEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData: responseData = {
    eventName: EVENTS.SET_DEALER_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function provideCardEvent(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.PROVIDED_CARDS_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function startUserTurnSocket(payload: any) {
  const { tableId, data } = payload;
  const responseData: responseData = {
    eventName: EVENTS.USER_TURN_STARTED_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function saveCardsInSorts(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.SAVE_CARDS_IN_SORTS_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function pickCardFromClosedDack(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.PICK_FROM_CLOSE_DECK_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function resuffalCardEvent(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.RESUFFAL_CARD,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function pickCardFromOpendDack(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.PICK_FROM_OPEN_DECK_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function discardCard(payload: any) {
  const { tableId, data } = payload;
  const responseData: responseData = {
    eventName: EVENTS.DISCARD_CARD_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function groupCard(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.GROUP_CARD_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function endDragCard(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.END_DRAG_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function openDeckCards(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.SHOW_OPENDECK_CARDS_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function finishEvent(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.FINISH_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function declareEvent(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.DECLARE_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function winnerEvent(payload: any) {
  const { data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.WINNER_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}


function scoreBoardEvent(payload: any) {
  const { data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.SCORE_BOARD_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function scoreBoardClientEvent(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.SCORE_BOARD_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function leaveTableEvent(payload: any) {
  const { data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.LEAVE_TABLE_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function userGameRejoined(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.USER_GAME_REJOINED,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function userReconnection(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.RECONNECTION_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function iAmBack(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.REJOIN_I_AM_BACK_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function userDrop(payload: any) {
  const { data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.DROP_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function lastDealEvent(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.LAST_DEAL_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function popUpEventClient(payload: any) {
  const { socket, data } = payload;
  let tableId = EMPTY;
  const responseData: responseData = {
    eventName: EVENTS.SHOW_POPUP_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function popUpEventRoom(payload: any) {
  const { tableId, data } = payload;
  Logger.debug(tableId, "popUpEventRoom :: tableId :: ", tableId)
  const responseData: responseData = {
    eventName: EVENTS.SHOW_POPUP_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}

function GTIEvent(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.SETTING_MENU_GAME_TABLE_INFO_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function updateUserWalletEvent(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.UPDATE_USER_WALLET_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}

function reJoinPopUpEvent(payload: any) {
  const { socket, data, tableId } = payload;
  const responseData: responseData = {
    eventName: EVENTS.REJOIN_POPUP_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
}



function newGameTimerEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData: responseData = {
    eventName: EVENTS.NEW_GAME_START_SOCKET_EVENT,
    data
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
}


CommonEventEmitter.on(EVENTS.HEART_BEAT_SOCKET_EVENT, heartBeatEvent);

CommonEventEmitter.on(EVENTS.ADD_PLAYER_IN_TABLE, addPlayerInTable);

CommonEventEmitter.on(EVENTS.JOIN_TABLE_SOCKET_EVENT, joinTableEvent);

CommonEventEmitter.on(EVENTS.SIGN_UP_SOCKET_EVENT, singUpCompleteEvent);

CommonEventEmitter.on(EVENTS.WAITING_TIMER_START, waitingTimerStart);

CommonEventEmitter.on(EVENTS.GAME_COUNT_DOWN, gameCountDownEvent);

CommonEventEmitter.on(EVENTS.LOCK_IN_PERIOD_SOCKET_EVENT, lockInPeriodEvent);

CommonEventEmitter.on(ROUND_TIMER_START_TIMER_EXPIED, roundTimerEnd);

CommonEventEmitter.on(LOCK_IN_PERIOD_EXPIRED, roundTimerExpired);

CommonEventEmitter.on(EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT, bootColletEvent);

CommonEventEmitter.on(BOOT_COLLECTING_START_TIMER_EXPIRED, tossCardTimer);

CommonEventEmitter.on(EVENTS.TOSS_CARD_SOCKET_EVENT, tossCardEvent);

CommonEventEmitter.on(TOSS_CARD_EXPIRED, roundDealerSetTimer);

CommonEventEmitter.on(EVENTS.SET_DEALER_SOCKET_EVENT, dealerPlayerEvent);

CommonEventEmitter.on(CARD_DEALING_TIMER_EXPIRED, cardDealingTimer);

CommonEventEmitter.on(EVENTS.PROVIDED_CARDS_EVENT, provideCardEvent);

CommonEventEmitter.on(EVENTS.USER_TURN_STARTED_SOCKET_EVENT, startUserTurnSocket);

CommonEventEmitter.on(PLAYER_TURN_TIMER_EXPIRED, seconderyTimer);

CommonEventEmitter.on(EVENTS.SAVE_CARDS_IN_SORTS_SOCKET_EVENT, saveCardsInSorts);

CommonEventEmitter.on(EVENTS.PICK_FROM_CLOSE_DECK_SOCKET_EVENT, pickCardFromClosedDack);

CommonEventEmitter.on(EVENTS.RESUFFAL_CARD, resuffalCardEvent);

CommonEventEmitter.on(EVENTS.PICK_FROM_OPEN_DECK_SOCKET_EVENT, pickCardFromOpendDack);

CommonEventEmitter.on(EVENTS.DISCARD_CARD_SOCKET_EVENT, discardCard);

CommonEventEmitter.on(EVENTS.GROUP_CARD_SOCKET_EVENT, groupCard);

CommonEventEmitter.on(EVENTS.END_DRAG_SOCKET_EVENT, endDragCard);

CommonEventEmitter.on(EVENTS.SHOW_OPENDECK_CARDS_EVENT, openDeckCards);

CommonEventEmitter.on(EVENTS.FINISH_SOCKET_EVENT, finishEvent);

CommonEventEmitter.on(EVENTS.DECLARE_SOCKET_EVENT, declareEvent);

CommonEventEmitter.on(EVENTS.USER_GAME_REJOINED, userGameRejoined);

CommonEventEmitter.on(EVENTS.RECONNECTION_SOCKET_EVENT, userReconnection);

CommonEventEmitter.on(EVENTS.REJOIN_I_AM_BACK_SOCKET_EVENT, iAmBack);

CommonEventEmitter.on(EVENTS.DROP_SOCKET_EVENT, userDrop);

CommonEventEmitter.on(EVENTS.LAST_DEAL_SOCKET_EVENT, lastDealEvent);

CommonEventEmitter.on(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, popUpEventClient);

CommonEventEmitter.on(EVENTS.SHOW_POPUP_ROOM_SOCKET_EVENT, popUpEventRoom);

CommonEventEmitter.on(EVENTS.SETTING_MENU_GAME_TABLE_INFO_SOCKET_EVENT, GTIEvent);

CommonEventEmitter.on(EVENTS.UPDATE_USER_WALLET_SOCKET_EVENT, updateUserWalletEvent);

CommonEventEmitter.on(EVENTS.REJOIN_POPUP_SOCKET_EVENT, reJoinPopUpEvent);

CommonEventEmitter.on(ROBOT_SEATNG_IN_TABLE_EXPIRED, (res) => {
  const { tableId } = res;
  // robotSeatInTable(tableId)
});

CommonEventEmitter.on(PLAYER_REJOIN_TIMER_EXPIRED, async (res) => {
  const { userId, tableId, socket } = res.data;
  Logger.info(tableId, "<<====res.data=========>>>", res.data)

  const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId) as defaultTableGamePlayInterface;
  if (tableGamePlay.tableState !== TABLE_STATE.DECLARED) {
    leaveTableHandler({ id: socket, tableId: tableId, userId: userId }, { userId, tableId, currentRound: NUMERICAL.ONE, isLeaveFromScoreBoard : false });
  }
});

CommonEventEmitter.on(DACLARE_PLAYER_TURN_TIMER_EXPIRED, (res) => {
  // Logger.info("<<====res=========>>>", res)
  declareHandler("_", res.data)
});

CommonEventEmitter.on(EVENTS.LEAVE_TABLE_SOCKET_EVENT, leaveTableEvent);

CommonEventEmitter.on(NEXT_TURN_DELAY, (res) => {
  // Logger.info("changeTurn : res :: ", res);
  changeTurn(res.tableId);
});

CommonEventEmitter.on(START_USER_TURN, (res) => {
  // Logger.info("startUserTurn : res ::", res.userId, res.seatIndex);
  startUserTurn(
    res.tableId,
    res.userId,
    res.seatIndex,
    res.tableGamePlay
  );

});

async function roundTimerEnd(payload: any) {
  let { timer, jobId, tableId, currentRound } = payload;
  await lockTimerStart({ timer, jobId, tableId, currentRound });
}

CommonEventEmitter.on(WAITING_FOR_PLAYER_TIMER_EXPIRED, async (res) => {
  const { tableId, currentRound } = res;
  Logger.info(tableId, "WAITING_FOR_PLAYER_TIMER_EXPIRED : res ::", res);

  await roundStartTimer(tableId, currentRound);

});

CommonEventEmitter.on(EVENTS.SCORE_BOARD_SOCKET_EVENT, scoreBoardEvent);

CommonEventEmitter.on(EVENTS.SCORE_BOARD_CLIENT_SOCKET_EVENT, scoreBoardClientEvent);

CommonEventEmitter.on(EVENTS.WINNER_SOCKET_EVENT, winnerEvent);

// EVENT EMITTER

CommonEventEmitter.on(EVENT_EMITTER.SHOW_AFTER_EXPIRE_SCORE_BOARD_VIEW, expireScoreBoardShow);

CommonEventEmitter.on(EVENT_EMITTER.EXPIRE_SCORE_BOARD_TIMER, nextRound);

CommonEventEmitter.on(EVENT_EMITTER.EXIRE_SECONDERY_TIMER, onTurnExpire);


CommonEventEmitter.on(EVENT_EMITTER.REMOVE_SOCKER_ID_FOR_JOIN_TABLE, async (data) => {
  await leaveClientInRoom(data.socket, data.tableId)
});

CommonEventEmitter.on(EVENTS.NEW_GAME_START_SOCKET_EVENT, newGameTimerEvent);


















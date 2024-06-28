import {EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../constants";
import { switchTableFormator } from "../InputDataFormator";
import Lock from '../lock';
import Errors from "../errors";
import Logger from "../logger";
import CommonEventEmitter from '../commonEventEmitter';
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../cache";
import leaveTableHandler from "./leaveTableHandler";
import { switchTableInput } from "../interfaces/inputOutputDataFormator";
import dropAndMoveManage from "../services/switchTable/helper/dropAndMoveManage";
import { ackEvent } from "../utils";


async function switchTableHandler(socket: any, switchTableData: switchTableInput, ack?: any) {
  const socketId = socket.id;
  const userId = String(switchTableData.userId) || socket.userId;
  const tableId = String(switchTableData.tableId) || socket.tableId;
  // let lock = await Lock.getLock().acquire([`${tableId}`], 2000);
  let lock:any =null;
  try {
    const formatedSwitchTableData = await switchTableFormator(switchTableData);
    Logger.info(tableId, " reqData : formatedSwitchTableData ====>> ", formatedSwitchTableData);

    lock = await Lock.getLock().acquire([tableId], 2000); 

    const [roundTableData, playerGamePlay] = await Promise.all([
      tableGamePlayCache.getTableGamePlay(tableId),
      playerGamePlayCache.getPlayerGamePlay(userId, tableId)
    ])
    if (!roundTableData || !playerGamePlay) { throw new Errors.UnknownError("Unable to get table data"); }
    Logger.info("switchTableHandler :: roundTableData ::==>>", roundTableData);
    Logger.info("switchTableHandler :: playerGamePlay ::==>>", playerGamePlay);

    if (
      roundTableData.tableState !== TABLE_STATE.WINNER_DECLARED &&
      roundTableData.tableState !== TABLE_STATE.SCORE_BOARD &&
      roundTableData.tableState!== TABLE_STATE.DECLAREING &&
      roundTableData.tableState!== TABLE_STATE.DECLARED
    ) {
      if (playerGamePlay.userStatus === PLAYER_STATE.PLAYING) {

        let playingPlayerCount = NUMERICAL.ZERO;
        for await (const seat of roundTableData.seats) {
          if (seat.userState === PLAYER_STATE.PLAYING) {
            playingPlayerCount += NUMERICAL.ONE;
          }
        }
        Logger.info("switchTableHandler :: playingPlayerCount ::===>>", playingPlayerCount);

        if (playingPlayerCount > NUMERICAL.ONE) {

          // if table state is winner or scoreboard tham this code not run;
          await dropAndMoveManage(tableId, userId);

          const [userProfile, tableGamePlay, tableConfig] = await Promise.all([
            userProfileCache.getUserProfile(userId),
            tableGamePlayCache.getTableGamePlay(tableId),
            tableConfigCache.getTableConfig(tableId),
          ])
          if (!userProfile) throw new Errors.UnknownError('Unable to get userProfile data');
          if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
          if (!tableConfig) throw new Errors.UnknownError('Unable to get table data');

          Logger.info(tableId, "tableGamePlay :: =>==>>", tableGamePlay);

          let userseatsDetails = tableGamePlay.seats.filter((element) => element.userId === userId && (element.userState === PLAYER_STATE.DROP));
          Logger.info(tableId, "userseatsDetails :: =>>", userseatsDetails)
          if (userseatsDetails.length > NUMERICAL.ZERO) {

            await Lock.getLock().release(lock);
            lock = null;
            await leaveTableHandler(socket, { userId: userseatsDetails[NUMERICAL.ZERO].userId, tableId, currentRound: NUMERICAL.ONE, isLeaveFromScoreBoard: false }, false);
            // if (socketId) { await leaveClientInRoom(socketId, tableId); }

            ackEvent.ackMid(
              EVENTS.SWITCH_TABLE_SOCKET_EVENT,
              { isSwitchTableAllow : false},
              socket.userId,
              tableId,
              ack
            );

          } else {
            throw new Errors.UnknownError('Unable to get table data')
          }
          return true;
        }
      }
      else {
        await Lock.getLock().release(lock);
        lock = null;
        await leaveTableHandler(socket, { userId, tableId, currentRound: NUMERICAL.ONE, isLeaveFromScoreBoard: false }, false);
        ackEvent.ackMid(
          EVENTS.SWITCH_TABLE_SOCKET_EVENT,
          { isSwitchTableAllow : true},
          socket.userId,
          tableId,
          ack
        );
      }

    }
    else {
      Logger.warn(tableId, "switchTableHandler state SCORE_BOARD or WINNER_DECLARED :: switchTableData ::>> ", switchTableData);
      ackEvent.ackMid(
        EVENTS.SWITCH_TABLE_SOCKET_EVENT,
        { isSwitchTableAllow : false},
        socket.userId,
        tableId,
        ack
      );
    }

  }
  catch (error: any) {
    Logger.error(tableId, `formatedSwitchTableData Error :: ${error}`)

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
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket,
        data: {
          isPopup: false,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: error.message,
          showTimer: false,
          tableId,
        }
      });
    }
  }
  finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId, error, ' leaveTable ');
    }
  }


}


export = switchTableHandler;
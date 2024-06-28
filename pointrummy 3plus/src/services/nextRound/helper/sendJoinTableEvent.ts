import { playerGamePlayCache } from "../../../cache";
import { diffSeconds } from "../../../common";
import { EVENTS, NUMERICAL, TABLE_STATE } from "../../../constants";
import { formatJoinTableData } from "../../../formatResponseData";
import { defaultTableConfig, formatedJTResponse, JTResponse } from "../../../interfaces/tableConfig";
import { defaultTableGamePlayInterface } from "../../../interfaces/tableGamePlay";
import Logger from "../../../logger";
import CommonEventEmitter from "../../../commonEventEmitter"
import { getConfig } from "../../../config";
import formatJoinTableSeats from "./formatJoinTableSeats";


const sendJoinTableEvent = async (
  tableId: string,
  tableGamePlay: defaultTableGamePlayInterface,
  tableConfig: defaultTableConfig,
  reconnect: boolean,
): Promise<boolean> => {
  const { USER_TURN_TIMER, GAME_START_TIMER, WAIT_FOR_OTHER_PLAYER_TIMER } = getConfig();

  try {
    Logger.info(tableId," sendJoinTableEvent tableId :: >> ",tableId)
    const formatedJoinTableResponse: any = [];

    for (let i = 0; i < tableGamePlay.seats.length; i++) {
      const element = tableGamePlay.seats[i];
      Logger.info(tableId," sendJoinTableEvent :: element :: >>  " + element)
      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(element.userId.toString(), tableId)
      Logger.info(tableId," sendJoinTableEvent :: playerGamePlay:  >>" + playerGamePlay)
      if (!playerGamePlay) throw Error('Unable to get player data');

      let resFormet: JTResponse = await formatJoinTableData(element, reconnect, playerGamePlay.userStatus);
      Logger.info(tableId," sendJoinTableEvent :: resFormet: >> " + resFormet)
      formatedJoinTableResponse.push(resFormet);
    }

    let rTimer: number = NUMERICAL.THIRTY;
    if (tableGamePlay.tableState === TABLE_STATE.ROUND_STARTED) {
      rTimer = diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
      rTimer = Math.ceil(Number(USER_TURN_TIMER) - rTimer) / NUMERICAL.THOUSAND;
    }

    let totalRoundTimer: number = NUMERICAL.MINUS_ONE;
    if (tableGamePlay.currentPlayerInTable > tableConfig.minPlayer) {

      // if (tableGamePlay.tableState === TABLE_STATE.WAITING_FOR_PLAYERS){
      //   totalRoundTimer =
      //     diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
      //     Logger.info("===bedore::::", totalRoundTimer);
      //     totalRoundTimer = Math.ceil((Number(WAITING_FOR_PLAYER) - rTimer) + Number(GAME_START_TIMER))  / NUMERICAL.THOUSAND;
      // }
      if (tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED) {
        totalRoundTimer =
          diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
        Logger.info(tableId," before :: totalRoundTimer ::>>", totalRoundTimer);
        totalRoundTimer = Math.ceil((Number(GAME_START_TIMER) - totalRoundTimer)) / NUMERICAL.THOUSAND;
      }
      else if (tableGamePlay.tableState === TABLE_STATE.WAIT_FOR_OTHER_PLAYERS) {
        totalRoundTimer =
          diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
        Logger.info(tableId," before ::: totalRoundTimer ::: >>", totalRoundTimer);
        totalRoundTimer = Math.ceil((Number(WAIT_FOR_OTHER_PLAYER_TIMER) - totalRoundTimer)) / NUMERICAL.THOUSAND;
      }
      Logger.info(tableId,"FINAL totalRoundTimer >> ", totalRoundTimer);
    }

    const formatedJoinTableSeatsRes = await formatJoinTableSeats(formatedJoinTableResponse, tableConfig.noOfPlayer,tableId)

    let formatedJTResponse: formatedJTResponse = {
      tableId,
      entryFee: tableConfig.entryFee,
      jointTable: formatedJoinTableSeatsRes,
      tableState: tableGamePlay.tableState,
      totalRoundTimer,
      dealerPlayer: tableGamePlay.dealerPlayer,
      validDeclaredPlayerSI: tableGamePlay.validDeclaredPlayerSI,
      validDeclaredPlayer: tableGamePlay.validDeclaredPlayer,
      currentTurnSeatIndex: tableGamePlay.currentTurnSeatIndex,
      currentTurn: tableGamePlay.currentTurn,
      totalUserTurnTimer: tableConfig.userTurnTimer / NUMERICAL.THOUSAND,
      userTurnTimer: rTimer,
      totalUserSeconderyTimer: 15,
      trumpCard: tableGamePlay.trumpCard,
      opendDeck: tableGamePlay.opendDeck,
      finishDeck: tableGamePlay.finishDeck,
      closedDeck: tableGamePlay.closedDeck,
      isSeconderyTimer: tableGamePlay.isSeconderyTimer,
      isRemainSeconderyTurns: true
    }
    Logger.info(tableId," formatedJTResponse ::: ", formatedJTResponse);

    CommonEventEmitter.emit(EVENTS.JOIN_TABLE_SOCKET_EVENT, {
      tableId ,
      data: formatedJTResponse
    });

    return true;
  } catch (e: any) {
    Logger.info(tableId,"---sendJoinTableEvent :: ERROR ::", e)
    Logger.error(tableId,'emitJoinTableEvent error', e);
    throw new Error(e);
  }
};

export = sendJoinTableEvent;
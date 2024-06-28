import { tableConfigCache, tableGamePlayCache } from "../../cache";
import { insertTableGamePlay } from "../../cache/tableGamePlay";
import Logger from "../../logger"
import { seatsInterface } from "../../interfaces/signup";
import getNextPlayer from "./helper/getNextPlayer";
import { getPlayingUserInRound } from "../common/getPlayingUser";
import CommonEventEmitter from '../../commonEventEmitter';
import { START_USER_TURN } from "../../constants/eventEmitter";
import { getPreviousPlayer } from "./helper";
import { getConfig } from "../../config";
import Lock from '../../lock';
import { defaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";
import { TABLE_STATE } from "../../constants";

const changeTurn = async (
  tableId: string,
): Promise<boolean> => {
  const { IS_CLOCKWISE_TURN } = getConfig();
  const lock = await Lock.getLock().acquire([`${tableId}`], 2000);
  try {
    Logger.info('tableTurn ', tableId);
    Logger.info(tableId, `Starting changeTurn for tableId : ${tableId}`);

    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
    ]) 
    if (!tableConfig) { throw new Error('Unable to get table config'); }
    if (!tableGamePlay) { throw new Error('Unable to get table game play'); }

    Logger.info(tableId, `changeTurn  :: tableGamePlay  :: >>`, tableGamePlay);

    if(tableGamePlay.tableState === TABLE_STATE.WINNER_DECLARED || tableGamePlay.tableState === TABLE_STATE.SCORE_BOARD){
      return true;
    }
    const tableGamePlayInfo: defaultTableGamePlayInterface = JSON.parse(JSON.stringify(tableGamePlay));
    const activePlayersData: seatsInterface[] = await getPlayingUserInRound(tableGamePlay);

    // change turn user
    let nextPlayer: seatsInterface = {} as seatsInterface;
    if (IS_CLOCKWISE_TURN) {
      nextPlayer = getNextPlayer(activePlayersData, tableGamePlay.currentTurn, tableId);
    } else {
      Logger.info(tableId, " changeTurn :: priviuosPlayer :: ", nextPlayer);
      nextPlayer = await getPreviousPlayer(activePlayersData, tableGamePlay.currentTurn, tableId);
      Logger.info(tableId, "changeTurn :: nextPlayer :: ", nextPlayer);
    }
    Logger.info(tableId, "changeTurn ::: nextPlayer :: ", nextPlayer);

    tableGamePlayInfo.currentTurn = nextPlayer.userId;
    tableGamePlayInfo.currentTurnSeatIndex = nextPlayer.si;
    tableGamePlayInfo.updatedAt = new Date().toString();

    await insertTableGamePlay(tableGamePlayInfo, tableId);
    Logger.info(tableId, " changeTurn :: nextPlayer :: tableGamePlay.currentTurn ::> ", tableGamePlayInfo.currentTurn);
    Logger.info(tableId, " changeTurn :: nextPlayer :: tableGamePlay.currentTurnSeatIndex ::> ", tableGamePlayInfo.currentTurnSeatIndex);

    CommonEventEmitter.emit(START_USER_TURN, {
      tableId,
      userId: nextPlayer.userId,
      seatIndex: nextPlayer.si,
      currentTurnSeatIndex: tableGamePlayInfo.currentTurnSeatIndex,
      tableGamePlay: tableGamePlayInfo
    });

    Logger.info(tableId, `Ending changeTurn for tableId : ${tableId}`);
    return true;
  } catch (error: any) {
    Logger.error(tableId, error, ` table ${tableId} function changeTurn`);
    throw new Error(`INTERNAL_ERROR_changeTurn() =====>> Error=${error}`);
  }
  finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId, error, ' leaveTable ');
    }
  }
};

export = changeTurn;



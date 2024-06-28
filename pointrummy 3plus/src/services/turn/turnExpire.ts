import Logger from "../../logger";
import {
  tableConfigCache,
  playerGamePlayCache,
  tableGamePlayCache
} from '../../cache';
import { successRes } from '../../interfaces/signup';
import { onTurnExpireCallInterface } from '../../interfaces/userTurn';
import { NUMERICAL } from '../../constants';
import leaveTableHandler from '../../requestHandlers/leaveTableHandler';
import Lock from "../../lock";
import { getUserProfile } from "../../cache/userProfile";
import { autoDiscard } from "./helper";
import { getConfig } from "../../config";
import { cancelPlayerTurnTimer } from "../../scheduler/cancelJob/playerTurnTimer.cancel";
import { cancelSeconderyTimer } from "../../scheduler/cancelJob/seconderyTimer.cancel";
import { nextTurnDelay } from "../../scheduler/queues/nextTurnDelay.queue";
const { CONTINUE_MISSING_TURN_COUNT } = getConfig();


async function onTurnExpire(
  data: onTurnExpireCallInterface
): Promise<successRes | boolean> {
  const { tableId, userId } = data;
  const lock = await Lock.getLock().acquire([`${tableId}`], 2000);
  try {
    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) throw Error('Unable to get Table Config Data');

    const { currentRound } = tableConfig;
    Logger.info(tableId,`Starting onTurnExpire for tableId : ${tableId} ,userId : ${userId} and round : ${currentRound}`);

    const [playerGamePlay, tableGamePlay, userData] = await Promise.all([
      playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
      getUserProfile(userId.toString())
    ])
    if (!tableGamePlay) throw Error('Unable to get Table Game Data');
    if (!playerGamePlay) throw Error('Unable to get Player Game Data');
    if (!userData) throw Error('Unable to get user Game Data');

    const { currentTurn } = tableGamePlay;
    if (currentTurn !== userId) throw Error('Invalid turn in onTurnExpire!');
    Logger.info(tableId," -- onTurnExpire Call : ==>>");

    const currentCards: string[] = [];
    playerGamePlay.currentCards.map((ele) => {
      ele.map((e: string) => { currentCards.push(e) })
    })

    Logger.info(tableId," turn expire : currentCards :: ", currentCards, "currentCards.length :: ", currentCards.length);
    tableGamePlay.isSeconderyTimer = false;

    if (currentCards.length == NUMERICAL.FOURTEEN) {
      
     await autoDiscard(userId, tableId, currentRound, playerGamePlay, tableGamePlay);

    } else {
      Logger.info(tableId," playerGamePlay.turnTimeOut :::", playerGamePlay.turnTimeOut);
      playerGamePlay.tCount++;
      playerGamePlay.turnTimeOut++;

      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

      Logger.info('CONTINUE_MISSING_TURN_COUNT :>> ', CONTINUE_MISSING_TURN_COUNT);
      if (playerGamePlay.turnTimeOut > Number(CONTINUE_MISSING_TURN_COUNT) ) {
        leaveTableHandler({id : userData?.socketId , tableId : tableId, userId : userId}, { userId, tableId, currentRound: NUMERICAL.ONE, isLeaveFromScoreBoard : false });
        return { success: true, error: null, tableId };
      }
    }

    await cancelPlayerTurnTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
    await cancelSeconderyTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);

    await nextTurnDelay({
      timer: NUMERICAL.ONE * NUMERICAL.ZERO,
      jobId: `nextTurn:${tableId}:${currentRound}`,
      tableId
    });

    Logger.info(tableId,`Ending onTurnExpire for tableId : ${tableId} ,userId : ${userId} and round : ${currentRound}`);
    return { success: true, error: null, tableId };
  } catch (error) {
    Logger.error(tableId,
      error,
      `table ${tableId} user ${userId} function onTurnExpire`
    );
    Logger.info(tableId,"onTurnExpire() Error :: ==>", error);
    throw new Error(`onTurnExpire() Error :: ==> ${error}`);
  } finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId,error, ' leaveTable ');
    }
  }
}

export = onTurnExpire;

import Logger from "../../logger";
import { EVENTS, NUMERICAL, PLAYER_STATE } from '../../constants';
import CommonEventEmitter from '../../commonEventEmitter';
import { defaultTableGamePlayInterface } from '../../interfaces/tableGamePlay';
import { successRes } from '../../interfaces/signup';
import { formatStartUserTurn } from '../../formatResponseData';
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache
} from '../../cache';
import { addTurnHistory } from '../turnHistory';
import { StartUserTurnResponse } from '../../interfaces/userTurn';
import { startPlayerTurnTimer } from "../../scheduler/queues/playerTurnTimer.queue";


const startUserTurn = async (
  tableId: string,
  currentTurnUserId: string,
  currentTurnSeatIndex: number,
  tableGamePlay: defaultTableGamePlayInterface,
): Promise<successRes> => {

  try {
    Logger.info(tableId,
      "------->> startUserTurn",
      "tableId",
      tableId,
      "currentTurnUserId",
      currentTurnUserId,
      "currentTurnSeatIndex",
      currentTurnSeatIndex
    )

    // Logger.info("------->> startUserTurn :: tableGamePlay :: tableGamePlay :: ",tableGamePlay)
    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) {
      throw Error('Unable to get Table Config Data');
    }
    const { currentRound } = tableConfig;

    Logger.info(tableId,`Starting startUserTurn for tableId : ${tableId} and round : ${currentRound} user ${currentTurnUserId}`);

    const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(currentTurnUserId, tableId);
    if (!playerGamePlay) { throw Error('Unable to get Table Config Data') }

    tableGamePlay.currentTurn = currentTurnUserId;
    tableGamePlay.currentTurnSeatIndex = currentTurnSeatIndex;
    tableGamePlay.isSeconderyTimer = false;
    Logger.info(tableId,`user ${currentTurnUserId} turn timer started ->>`);

    let isRemainSeconderyTimer = false;
    if (playerGamePlay.seconderyTimerCounts < NUMERICAL.FOUR) {
      isRemainSeconderyTimer = true;
    }

    const formatedStartUserTurnData: StartUserTurnResponse =
      await formatStartUserTurn(
        tableConfig,
        currentTurnUserId,
        currentTurnSeatIndex,
        false,
        isRemainSeconderyTimer,
        tableId
      );

    playerGamePlayCache.insertPlayerGamePlay(
      playerGamePlay,
      tableId
    );

    const currentTime = new Date();
    tableGamePlay.turnCount += NUMERICAL.ONE;
    tableGamePlay.updatedAt = new Date().toString();
    tableGamePlay.tableCurrentTimer = new Date(
      currentTime.setSeconds(currentTime.getSeconds() + Number(tableConfig.userTurnTimer))
    );

    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);
    Logger.info(tableId,'==== ResData : formatedStartUserTurnData ::', formatedStartUserTurnData);

    CommonEventEmitter.emit(EVENTS.USER_TURN_STARTED_SOCKET_EVENT, {
      tableId: tableId,
      data: formatedStartUserTurnData
    });

    // add turn details in history
    await addTurnHistory(tableId, currentRound, tableGamePlay, playerGamePlay);

    await startPlayerTurnTimer({
      timer: tableConfig.userTurnTimer,
      jobId: `${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,
      tableId: tableConfig._id,
      userId: playerGamePlay.userId
    });

    Logger.info(tableId,
      `Ending startUserTurn for tableId : ${tableId} and round : ${currentRound} user ${currentTurnUserId}`
    );
    return { success: true, error: null, tableId };

  } catch (error: any) {
    Logger.info(tableId,error);
    Logger.error(tableId,error, ` table ${tableId} function startUserTurn `);
    throw new Error(`startUserTurn() Error : ===>> ${error}`);
  }
};

export = startUserTurn;

import Logger from "../../logger"
import { RoundStartInterface } from '../../interfaces/gameStart';
import { roundStart } from './roundStart';

async function roundTimerExpired(
  gameData: RoundStartInterface
): Promise<boolean> {
  const { tableId, currentRound } = gameData;
  try {
    Logger.info(tableId,`Starting roundTimerExpired for tableId : ${tableId} and round : ${currentRound}`);

    await roundStart(tableId, currentRound);

    Logger.info(tableId,`Ending roundTimerExpired for tableId : ${tableId} and round : ${currentRound}`)

    return false;

  } catch (error: any) {
    Logger.error(tableId,
      error,
      ` table ${tableId} round ${currentRound} function roundTimerExpired`
    );
    throw error;
  }
}

export = roundTimerExpired;

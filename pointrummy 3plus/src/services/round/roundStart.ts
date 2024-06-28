import Logger from "../../logger"
import { tableGamePlayCache } from '../../cache';
import { bootCollecting } from "../bootAmountCollect/index";
import { NUMERICAL } from "../../constants";

async function roundStart(
  tableId: string,
  currentRound: number
): Promise<boolean> {
  try {
    Logger.info(tableId,`Starting roundStart for tableId : ${tableId} and round : ${currentRound}`);

    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
    if (!tableGamePlay) throw Error('Unable to get data')

    tableGamePlay.tableCurrentTimer = new Date();
    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)

    if (tableGamePlay.currentPlayerInTable > NUMERICAL.ONE) {
      await bootCollecting(tableId, currentRound, true);
    }

    Logger.info(tableId,`Ending roundStart for tableId : ${tableId} and round : ${currentRound}`);
    return false;

  } catch (error: any) {
    Logger.error(tableId,
      error,
      `table ${tableId} round  ${currentRound} funtion roundStart`
    );
    Logger.info(tableId,"ERROR ::", error);
    throw new Error(`INTERNAL_ERROR_roundStart()`);
  }
}

const exportedObject = {
  roundStart
};

export = exportedObject;

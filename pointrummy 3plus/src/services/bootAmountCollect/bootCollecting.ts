import Logger from "../../logger";
import { tableGamePlayCache } from '../../cache';
import firstRoundBootCollect from './firstRoundBootCollect';
import { getConfig } from "../../config";
import { bootCollectingStartTimer } from "../../scheduler/queues/bootCollectingStartTimer.queue";
const { BOOT_COLLECT_TIMER } = getConfig();

async function bootCollecting(
  tableId: string,
  currentRound: number,
  collectAmountFlag: boolean
): Promise<boolean> {
  try {
    Logger.info(tableId,`Starting bootCollecting for tableId : ${tableId} collectAmountFlag : ${collectAmountFlag}`);   
    let firstRoundBootCollectFlag = true;
    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
    if (!tableGamePlay) {
      Logger.error(tableId,'error');
      throw Error('Unable to get data');
    }
    if (collectAmountFlag) {
      firstRoundBootCollectFlag = await firstRoundBootCollect(tableId, currentRound);
    }
    Logger.info(tableId,`bootCollecting ::: firstRoundBootCollectFlag :: `, firstRoundBootCollectFlag);

    if(firstRoundBootCollectFlag) {
      
      // // Add tracked lobby in db
      // await addLobbyTracking(tableId);
      
      Logger.info(tableId,`bootCollecting timer for tableId : ${tableId}`);
      await bootCollectingStartTimer({
        timer: Number(BOOT_COLLECT_TIMER),
        jobId: `${tableGamePlay.gameType}:gameStart:${tableId}`,
        tableId,
        currentRound,
        // tableGamePlay
      });

    }

    Logger.info(tableId,`Ending bootCollecting for tableId : ${tableId}`);
    return false;
  } catch (error: any) {
    Logger.error(tableId,
      error,
      `  table ${tableId} round ${currentRound} function bootCollecting`
    );
    throw new Error(`INTERNAL_ERROR_bootCollecting() ${error}`);
  }
}


export = bootCollecting;
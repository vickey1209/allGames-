import Logger from "../../logger"
import { defaultTableGamePlayInterface } from '../../interfaces/tableGamePlay';
import { defaultTableGamePlayData } from '../../defaultGenerator';
import { insertTableGamePlay } from '../../cache/tableGamePlay';

interface setUpRoundData {
  tableId: string;
  gameType : string;
}
async function setupFirstRound(data: setUpRoundData): Promise<boolean> {
  const { tableId, gameType} = data;
  try {
    Logger.info(tableId,`Starting setupFirstRound for tableId : ${tableId}`);

    const tableGamePlayData: defaultTableGamePlayInterface = await defaultTableGamePlayData(gameType);
    // Logger.info("====tableGamePlayData====", tableGamePlayData);
    await insertTableGamePlay(tableGamePlayData, tableId),

    Logger.info(tableId,`Ending setupFirstRound for tableId : ${tableId}`);
    
    return true;
  } catch (error: any) {
    Logger.error(tableId,
      error,
      ` table ${tableId} function setupFirstRound`
    );
    throw new Error(
      error && error.message && typeof error.message === 'string'
        ? error.message
        : `Error in setupFirstRound`
    );
  }
}

export = setupFirstRound;

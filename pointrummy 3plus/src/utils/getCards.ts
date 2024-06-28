import { setDistributedCard, shuffleCardData } from "../services/shuffleCards";
import Logger from "../logger";
import { tableConfigCache, tableGamePlayCache } from "../cache";


async function getCards(
    tableId: string,
    currentRound: number,
    totalActivePlayer: number
  ): Promise<shuffleCardData> {
    try {
      Logger.info( tableId,`Starting getCards for tableId : ${tableId} and round : ${currentRound}`);
  
      const [tableConfig, tableGamePlay] = await Promise.all([
        tableConfigCache.getTableConfig(tableId),
        tableGamePlayCache.getTableGamePlay(tableId)
      ]);
      if (!tableGamePlay || !tableConfig) throw Error('Unable to get data');
      let userCards = await setDistributedCard(
        tableConfig.noOfPlayer,
        totalActivePlayer,
        tableId
      );
      Logger.info(tableId,`Ending getCards for tableId : ${tableId} and round : ${currentRound}`, "userCards ::  >>",userCards);
      return userCards;
    } catch (error: any) {
      Logger.error(tableId,
        error,
        ` table ${tableId} round ${currentRound} function getCards `
      );
      Logger.info(tableId," INTERNAL_ERROR_getCards()=== error ==", error);
      throw new Error(` INTERNAL_ERROR_getCards() =====>> ${error}`);
    }
  }

export = getCards ;
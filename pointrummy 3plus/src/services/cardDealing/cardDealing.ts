import Logger from "../../logger";
import {
  tableGamePlayCache,
  playerGamePlayCache,
  tableConfigCache,
  userProfileCache
} from '../../cache';
import CommonEventEmitter from '../../commonEventEmitter';
import { formateProvidedCardsIF } from '../../interfaces/round';
import { formateProvidedCards } from '../../formatResponseData';
import {
  EVENTS,
  TABLE_STATE,
  PLAYER_STATE

} from '../../constants';
import { manageAndUpdateDataInterface } from "../../interfaces/manageAndUpdateData";
import manageAndUpdateData from "../../utils/manageCardData";

async function cardDealing(
  tableId: string,
  currentRound: number
): Promise<boolean> {
  // const lock = await Lock.getLock().acquire([`${tableId}`], 2000);
  try {
    Logger.info(tableId,
      `Starting cardDealing for tableId : ${tableId} and round : ${currentRound}`
    );
    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId)
    ]);
    if (!tableGamePlay || !tableConfig) throw Error('Unable to get data');
    Logger.info(tableId, "cardDealing :: tableGamePlay  ==>>", tableGamePlay);

    for (let i = 0; i < tableGamePlay.seats.length; i++) {
      const ele = tableGamePlay.seats[i];
      if (ele.userState === PLAYER_STATE.PLAYING) {

        const [playerGamePlay, userProfile] = await Promise.all([
          await playerGamePlayCache.getPlayerGamePlay(
            tableGamePlay.seats[i].userId.toString(),
            tableId
          ),
          userProfileCache.getUserProfile(tableGamePlay.seats[i].userId)
        ]);

        if (!playerGamePlay || !userProfile)
          throw Error(':: Unable to get data card dealing :: ');


        // await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
        Logger.info(tableId, ' playerGamePlay.userStatus ::: ', playerGamePlay.userStatus);
        Logger.info(tableId, "userProfile :: ", userProfile)


        if (playerGamePlay.userStatus === PLAYER_STATE.PLAYING) {

          const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
            await manageAndUpdateData(playerGamePlay.currentCards, playerGamePlay)

          const formatedProvidedCardData: formateProvidedCardsIF =
            await formateProvidedCards(
              tableId,
              playerGamePlay.userId,
              tableGamePlay.closedDeck,
              tableGamePlay.opendDeck,
              tableGamePlay.trumpCard,
              cards,
            );

          CommonEventEmitter.emit(EVENTS.PROVIDED_CARDS_EVENT, {
            socket: userProfile.socketId,
            data: formatedProvidedCardData,
            tableId
          });

          playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
          playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
          playerGamePlay.cardPoints = totalScorePoint;
        }
        await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

      }

      tableGamePlay.tableState = TABLE_STATE.START_DEALING_CARD;

      await Promise.all([
        tableConfigCache.setTableConfig(tableId, tableConfig),
        tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
      ]);
      
    }

    Logger.info(tableId, `Ending cardDealing for tableId : ${tableId} and round : ${currentRound}`);

    return true;
  } catch (error: any) {
    Logger.error(tableId,
      error,
      ` table ${tableId} round ${currentRound} function cardDealing `
    );
    Logger.info(tableId, "==== INTERNAL_ERROR_cardDealing() ==== Error:", error);
    throw new Error(`INTERNAL_ERROR_cardDealing() ${error} `);
  }
  finally {
    try {
      // if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId, error, ' cardDealing ');
    }
  }
}

export = cardDealing;

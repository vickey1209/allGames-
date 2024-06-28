import  Logger  from '../../logger';
import { successRes } from '../../interfaces/signup';
import { defaulPlayerGamePlayInterface } from '../../interfaces/playerGamePlay';
import { turnHistoryCache } from '../../cache';
import { PLAYER_STATE } from '../../constants';
import { gameDetailsInterface } from '../../interfaces/turnHistory';
import roundHistory from './roundHistory';

async function updateTurnHistory(
  tableId: string,
  currentRound: number,
  card: string,
  playerGamePlay: defaulPlayerGamePlayInterface,
  timeOutThrow: boolean
): Promise<successRes> {
  try {
    Logger.info(tableId,
      `Starting updateTurnHistory for tableId : ${tableId} and round : ${currentRound}`
    );
    let turnHistory: Array<gameDetailsInterface> | null =
      await turnHistoryCache.getTurnHistory(tableId);

    if (!turnHistory) {
      throw new Error('turn history not getting');
    }

    const currentRoundHistory: gameDetailsInterface =
      await roundHistory.getCurrentRoundHistory(turnHistory, currentRound);
    // get history object index which needs to update
    
    if (currentRoundHistory) {
      currentRoundHistory.turnsDetails[
        currentRoundHistory.turnsDetails.length - 1
      ].cardPicked = playerGamePlay.lastPickCard;
      currentRoundHistory.turnsDetails[
        currentRoundHistory.turnsDetails.length - 1
      ].cardDiscarded = card;
      currentRoundHistory.turnsDetails[
        currentRoundHistory.turnsDetails.length - 1
      ].cardState = playerGamePlay.groupingCards;
      currentRoundHistory.turnsDetails[
        currentRoundHistory.turnsDetails.length - 1
      ].cardPoints = playerGamePlay.cardPoints;
      currentRoundHistory.turnsDetails[
        currentRoundHistory.turnsDetails.length - 1
      ].cardPickSource = playerGamePlay.pickFromDeck;

      if (timeOutThrow) {
        currentRoundHistory.turnsDetails[
          currentRoundHistory.turnsDetails.length - 1
        ].turnStatus = PLAYER_STATE.TIMEOUT;
      } else {
        currentRoundHistory.turnsDetails[
          currentRoundHistory.turnsDetails.length - 1
        ].turnStatus = PLAYER_STATE.TURN;
      }
    }

    Logger.info(tableId,'updateTurnHistory ::  after:>> ', currentRoundHistory);

    turnHistory = await roundHistory.replaceRoundHistory(
      turnHistory,
      currentRound,
      currentRoundHistory || turnHistory
    );
    
    await Promise.all([turnHistoryCache.setTurnHistory(tableId, turnHistory)]);
    Logger.info(tableId,
      `Ending updateTurnHistory for tableId : ${tableId} and round : ${currentRound}`
    );
    return { success: true, error: null, tableId };
  } catch (error: any) {
    Logger.error(tableId,
      error,
      ` table ${tableId} currentRound ${currentRound} function updateTurnHistory`
    );
    throw new Error(error);
  }
}

export = updateTurnHistory;

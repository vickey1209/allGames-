import Logger from "../../logger";
import Errors from "../../errors";
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache } from "../../cache";
import { defaulPlayerGamePlayInterface } from "../../interfaces/playerGamePlay";
import { NUMERICAL } from "../../constants";
import { cancelDeclarePlayerTurnTimer } from "./declarePlayerTurnTimer.cancel";
import { cancelPlayerTurnTimer } from "./playerTurnTimer.cancel";
import { cancelSeconderyTimer } from "./seconderyTimer.cancel";
import { cancelRejoinTimer } from "./rejoinTimer.cancel";
import { cancelNextTurnDelayTimer } from "./nextTurnDelayTimer.cancel";
import { cancelWaitingForPlayerTimer } from "./waitingForPlayerTimer.cancel";
import { cancelRoundTimerStart } from "./roundTimerStart.cancel";
import { cancelBootCollectingTimer } from "./bootCollectingTimer.cancel";
import { cancelCardDealingTimer } from "./cardDealingTimer.cancel";
import { cancelLockTimer } from "./lockTimer.cancel";
import { cancelTossCardTimer } from "./tossCardTimer.cancel";
import { cancelScoreBoardTimer } from "./scoreBoardTimer.cancel";
import { cancelShowScoreBoardTimer } from "./showScoreBoardTimer.cencal";


export async function cancelAllScheduler(tableId: string){
    try {
        Logger.info(tableId, `---- cancelAllScheduler :: START==>>`);

        const [tableGamePlay, tableConfig] = await Promise.all([
            tableGamePlayCache.getTableGamePlay(tableId),
            tableConfigCache.getTableConfig(tableId)
        ])
        if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
        if (!tableConfig) throw new Errors.UnknownError('Unable to get table config data');

        for await (const player of tableGamePlay.seats) {

            const userPGP: defaulPlayerGamePlayInterface | null = await playerGamePlayCache.getPlayerGamePlay(player.userId, tableId);
            if(userPGP) {
                await Promise.all([
                    await cancelDeclarePlayerTurnTimer(`declare:${tableId}:${userPGP?.userId}:${tableConfig.currentRound}`, tableId),
                    await cancelPlayerTurnTimer(`${tableId}:${userPGP?.userId}:${tableConfig.currentRound}`, tableId),
                    await cancelSeconderyTimer(`${tableId}:${userPGP?.userId}:${tableConfig.currentRound}`, tableId),
                    await cancelRejoinTimer(`rejoinTimer:${tableId}:${userPGP?.userId}:${NUMERICAL.ONE}`, tableId),
                 ])
            }
        }

        await Promise.all([
            
             await cancelNextTurnDelayTimer(`nextTurn:${tableId}:${NUMERICAL.ONE}`, tableId),
             await cancelWaitingForPlayerTimer(`waitingForPlayerTimer:${tableId}`, tableId),
             await cancelRoundTimerStart(`${tableConfig.gameType}:roundTimerStart:${tableId}`, tableId),

             await cancelBootCollectingTimer(`${tableGamePlay.gameType}:gameStart:${tableId}`, tableId),
             await cancelCardDealingTimer(`${tableGamePlay.gameType}:cardDealing:${tableId}`, tableId),
             await cancelLockTimer(`lockTimerStart:${tableId}`, tableId),
             await cancelTossCardTimer(`${tableGamePlay.gameType}:tossCard:${tableId}`, tableId),

             await cancelScoreBoardTimer(`StartScoreBoardTimer:${tableId}`, tableId),
             await cancelShowScoreBoardTimer(`scoreBoard:${tableId}:${NUMERICAL.ONE}`, tableId),
        ])

        Logger.info(tableId, `---- cancelAllScheduler :: END ==>>`);

        return true;
    } catch (e) {
    Logger.error(tableId, '---- cancelAllScheduler  :: ==>>', e);
}
};

// export = cancelAllScheduler;
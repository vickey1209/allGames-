import { EMPTY, EVENTS, NUMERICAL } from "../../../constants";
import { manageAndUpdateDataInterface } from "../../../interfaces/manageAndUpdateData";
import { defaulPlayerGamePlayInterface } from "../../../interfaces/playerGamePlay";
import { defaultTableGamePlayInterface } from "../../../interfaces/tableGamePlay";
import manageAndUpdateData from "../../../utils/manageCardData";
import { selectUserCardToThrow } from "../../cardThrow";
import Logger from "../../../logger";
import CommonEventEmitter from '../../../commonEventEmitter';
import updateTurnHistory from "../../turnHistory/updateTurnHistory";
import { playerGamePlayCache, tableGamePlayCache } from "../../../cache";
import { discardCardResponse } from "../../../interfaces/inputOutputDataFormator";
import { formatDiscardCardData } from "../../../formatResponseData";

async function autoDiscard(userId: string, tableId: string, currentRound : number, playerGamePlay: defaulPlayerGamePlayInterface, tableGamePlay: defaultTableGamePlayInterface) {

    try {

        let throwCardOnTimeOut: string = await selectUserCardToThrow(playerGamePlay, tableGamePlay);
        Logger.info(tableId, " throwCardOnTimeOut :: ", throwCardOnTimeOut);

        const result = playerGamePlay.currentCards.filter(ele => ele.length > NUMERICAL.ZERO);
        playerGamePlay.currentCards = result;

        Logger.info(tableId, " playerGamePlay currentCards length ==>>", playerGamePlay.currentCards);
        // Logger.info("==playerGamePlay currentCards length ==>>",  playerGamePlay.currentCards[0].length);
        
        const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
            await manageAndUpdateData(playerGamePlay.currentCards, playerGamePlay);

        await updateTurnHistory(
            tableId,
            currentRound,
            throwCardOnTimeOut,
            playerGamePlay,
            true
        );

        playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
        playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
        playerGamePlay.cardPoints = totalScorePoint;
        playerGamePlay.pickFromDeck = EMPTY;
        playerGamePlay.tCount++;
        tableGamePlay.opendDeck.unshift(throwCardOnTimeOut);
        tableGamePlay.updatedAt = new Date().toString();
        tableGamePlay.discardedCardsObj = [{
            userId: userId,
            card: throwCardOnTimeOut,
            seatIndex: playerGamePlay.seatIndex
        }]

        await Promise.all([
            playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
            tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
        ])

        const formatedDiscardCardData: discardCardResponse =
            await formatDiscardCardData(
                playerGamePlay.userId,
                playerGamePlay.seatIndex,
                tableId,
                cards,
                totalScorePoint,
                tableGamePlay.opendDeck
            );

        Logger.info(tableId, "Auto Discard : formatedDiscardCardData ::: ", formatedDiscardCardData);

        CommonEventEmitter.emit(EVENTS.DISCARD_CARD_SOCKET_EVENT, {
            tableId: tableId,
            data: formatedDiscardCardData
        });

        return true;

    } catch (error) {
        Logger.error(tableId,
            error,
            ` table ${tableId} round ${currentRound} funciton autoDiscard`
        );
        throw new Error(`INTERNAL_ERROR_autoDiscard() ${error}`);
    }


}

export = autoDiscard;
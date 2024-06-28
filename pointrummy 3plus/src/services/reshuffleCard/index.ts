import { tableGamePlayCache } from "../../cache";
import { EVENTS, MESSAGES, NUMERICAL } from "../../constants";
import CommonEventEmitter from '../../commonEventEmitter';
import Logger from "../../logger";
import { ResuffalDataResponse } from "../../interfaces/inputOutputDataFormator";
import { formatResuffalData } from "../../formatResponseData";
import { shuffleCards } from "../../common";
import { defaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";

async function reshuffleCard(tableGamePlay: defaultTableGamePlayInterface, tableId: string) {

    try {

        let closedDeck: string[] = tableGamePlay.closedDeck;
        let opendDeck: string[] = tableGamePlay.opendDeck;
        Logger.info(tableId,'for reshuffleCard use : closedDeck Cards', closedDeck.length);
        Logger.info(tableId,'for reshuffleCard use : opendDeck Cards', opendDeck.length);

        if (closedDeck.length == NUMERICAL.ZERO) {
            closedDeck = opendDeck;
            closedDeck = await shuffleCards(closedDeck)
            opendDeck = closedDeck.splice(NUMERICAL.ZERO, NUMERICAL.ONE);

            tableGamePlay.closedDeck = closedDeck;
            tableGamePlay.opendDeck = opendDeck;

            const formatedResuffalData: ResuffalDataResponse =
                await formatResuffalData(
                    closedDeck,
                    opendDeck,
                    tableId
                );
            Logger.info(tableId,"formatedResuffalData :: ", formatedResuffalData);

            // let nonProdMsg = "Resuffle Cards";
            // CommonEventEmitter.emit(EVENTS.SHOW_POPUP_ROOM_SOCKET_EVENT, {
            //     tableId,
            //     data: {
            //         isPopup: true,
            //         popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
            //         title: nonProdMsg,
            //         message: MESSAGES.ERROR.RESUFFLE_CARDS_MSG,
            //         showTimer: false,
            //         tableId
            //     }
            // });
            // CommonEventEmitter.emit(EVENTS.RESUFFAL_CARD, {
            //     tableId: tableId,
            //     data: formatedResuffalData
            // });
        }
        await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

        return true;

    } catch (error) {
        Logger.error(tableId,"reshuffleCard :: ERROR : ", error);
    }

}

export = reshuffleCard;
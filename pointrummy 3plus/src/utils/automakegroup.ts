import { NUMERICAL } from "../constants";
import logger from "../logger";

async function autoMakeGroup(currentCard:any) {
    try {
        let newGroup: string[] = [];
        let cardsGroup: string[][] = [];

        for await (const card of currentCard) {
            if (card.length === NUMERICAL.ONE) {
                newGroup.push(card[0]);
            } else if (card.length > NUMERICAL.ONE) {
                cardsGroup.push(card);
            }
        }

        if (newGroup.length > NUMERICAL.ZERO) {
            cardsGroup.push(newGroup);
        }

        if (cardsGroup.length > NUMERICAL.SIX) {
            logger.info("------------>> autoMakeGroup <<----------------- :: 1")
            return false;
        }
        else {
            return cardsGroup;
        }
        
    } catch (error) {
        logger.error("--- autoMakeGroup :: ERROR :: ", error);
        throw error;
    }
}

export = autoMakeGroup;
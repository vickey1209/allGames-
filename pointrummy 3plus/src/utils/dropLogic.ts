import { playerGamePlayCache } from "../cache";
import { NUMERICAL } from "../constants";
import Logger from "../logger";
import Errors from "../errors";


async function dropLogic(tableId: string, userId: string): Promise<number> {

    try {
        const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(userId, tableId);
        if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');

        let scorePoint: number = NUMERICAL.ZERO;

        //three drop logic
        // if (playerGamePlay.tCount == NUMERICAL.ZERO) {
        //     scorePoint = NUMERICAL.TWENTY;
        // }
        // else if (playerGamePlay.tCount == NUMERICAL.ONE) {
        //     scorePoint = NUMERICAL.FOURTY;
        // }
        // else if (playerGamePlay.tCount > NUMERICAL.ONE) {
        //     scorePoint = NUMERICAL.EIGHTY;
        // }


        //2 Drop and turn count logic
        // if (playerGamePlay.tCount == NUMERICAL.ZERO) {
        //     scorePoint = NUMERICAL.TWENTY;
        // }
        // else {
        //     scorePoint = NUMERICAL.FOURTY;
        // }


        //2 Drop and pick card logic
        scorePoint = (playerGamePlay.ispickCard) ? NUMERICAL.FOURTY : NUMERICAL.TWENTY;
      
        Logger.info(tableId, "dropLogic ::scorePoint =>> ", scorePoint);
        return scorePoint;

    } catch (error) {
        Logger.error(tableId, `dropLogic Error :: ${error}`)
        Logger.info(tableId, "<<======= dropLogic() Error ======>>", error);
        throw new Error("dropLogic set value key error");
    }
}

export = dropLogic;
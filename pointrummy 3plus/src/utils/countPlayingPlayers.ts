import { NUMERICAL, PLAYER_STATE } from "../constants";
import { defaultTableGamePlayInterface } from "../interfaces/tableGamePlay";
import logger from "../logger";


async function countPlayingPlayers(
    tableGamePlay: defaultTableGamePlayInterface,
    tableId: string,
): Promise<number> {
    try {
        let count: number = NUMERICAL.ZERO;
        for await (const seat of tableGamePlay.seats) {
            if (seat.userState === PLAYER_STATE.PLAYING) {
                count += 1;
            }
        }
        return count
    } catch (error) {
        logger.info(tableId,"---- countPlayingPlayers :: ERROR: " + error);
        throw error;
    }
}

export = countPlayingPlayers;
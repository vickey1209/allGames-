import { getConfig } from "../../../config";
import { NUMERICAL, PLAYER_STATE } from "../../../constants";
import { seatsInterface } from "../../../interfaces/signup";
import { defaultTableGamePlayInterface } from "../../../interfaces/tableGamePlay";
import Logger from "../../../logger";


async function dealerSelect(
    tableGamePlay: defaultTableGamePlayInterface
): Promise<number> {
    const { IS_CLOCKWISE_TURN } = getConfig()
    try {
        let DLR: number = NUMERICAL.ZERO;
        if (IS_CLOCKWISE_TURN) {
            let playingPlayers: seatsInterface[] = [];
            let index: number = NUMERICAL.ZERO;
            let count = NUMERICAL.ZERO;
            tableGamePlay.seats.map((player, ind) => {
                if (player.userState === PLAYER_STATE.PLAYING) {
                    playingPlayers.push(player)
                }
            })

            for (const player of playingPlayers) {
                if (player.si === tableGamePlay.tossWinPlayer) {
                    index = count
                }
                count += NUMERICAL.ONE;
            }

            let nextIndex = (index - 1) % playingPlayers.length;
            if(nextIndex === NUMERICAL.MINUS_ONE){
                nextIndex = playingPlayers.length - NUMERICAL.ONE;
            }
            return playingPlayers[nextIndex].si

        } else {

            let playingPlayers: seatsInterface[] = [];
            let index: number = NUMERICAL.ZERO;
            let count = NUMERICAL.ZERO;
            tableGamePlay.seats.map((player, ind) => {
                if (player.userState === PLAYER_STATE.PLAYING) {
                    playingPlayers.push(player)
                }
            })

            for (const player of playingPlayers) {
                if (player.si === tableGamePlay.tossWinPlayer) {
                    index = count
                }
                count += NUMERICAL.ONE;
            }

            let nextIndex = (index + 1) % playingPlayers.length;
            return playingPlayers[nextIndex].si
        }
    } catch (error) {
        Logger.error("--- dealerSelect :: ERROR :: ", error);
        throw error;
    }
}

export = dealerSelect;
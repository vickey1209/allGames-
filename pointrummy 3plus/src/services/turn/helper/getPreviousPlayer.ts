import { PLAYER_STATE } from "../../../constants";
import { seatsInterface } from "../../../interfaces/signup";
import Logger from "../../../logger"

async function getPreviousPlayer(
    activePlayerData: seatsInterface[],
    currentTurn: string,
    tableId: string,
): Promise<seatsInterface> {
    try {
        Logger.info(tableId, " getPreviousPlayer ::  activePlayerData :: >>", activePlayerData);
        Logger.info(tableId, " getPreviousPlayer ::  currentTurn :: >>", currentTurn);

        let playingPlayers: Array<seatsInterface> = [];
        for await (const user of activePlayerData) {
            if (user.userId === currentTurn) {
                if (
                    user.userState === PLAYER_STATE.DROP ||
                    user.userState === PLAYER_STATE.LEAVE ||
                    user.userState === PLAYER_STATE.LOSS ||
                    user.userState === PLAYER_STATE.DISCONNECTED ||
                    user.userState === PLAYER_STATE.QUIT ||
                    user.userState === PLAYER_STATE.WRONG_SHOW
                ) {
                    playingPlayers.push(user);
                }
            }
        }

        for await (const user of activePlayerData) {
            if (user.userState === PLAYER_STATE.PLAYING) {
                playingPlayers.push(user);
            }
        }

        playingPlayers.sort((a, b) => {
            return a.si - b.si
        });


        let currentIndex: number = -1;
        playingPlayers.map((player, index) => {
            if (player.userId === currentTurn) {
                currentIndex = index;
            }
        })


        Logger.info(tableId," getPreviousPlayer :: currentTurn ::  ===>>", currentTurn)
        let previousIndex = (currentIndex - 1) % playingPlayers.length;


        if (previousIndex === -1) {
            previousIndex = playingPlayers.length - 1;
        }
        Logger.info(tableId," getPreviousPlayer :: previousIndex ::  ===>>", previousIndex)

        let turnUserData: seatsInterface = playingPlayers[previousIndex];
        Logger.info(tableId,"  turnUserData  :: >>>", turnUserData);
        return turnUserData;

    } catch (error) {
        Logger.error(tableId,"--- getPreviousPlayer :: ERROR :: " + error);
        throw error;
    }
}

export = getPreviousPlayer;
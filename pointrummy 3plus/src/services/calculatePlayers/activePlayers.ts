import Logger from "../../logger";
import { PLAYER_STATE } from '../../constants';
import { playerGamePlayCache } from '../../cache';
import { seatsInterface } from '../../interfaces/signup';
import { defaulPlayerGamePlayInterface } from '../../interfaces/playerGamePlay';

async function findActivePlayers(
  seats: Array<seatsInterface>,
  tableId: string,
  currentRound: number
): Promise<Array<defaulPlayerGamePlayInterface>> {
  try {
    Logger.info(tableId,
      `Starting findActivePlayers for tableId : ${tableId} and round : ${currentRound}`
    );
    const playerGamePlays: any[] = [];
    await Promise.all(
      seats.map(async (seat) => {
        const tempPlayer = await playerGamePlayCache.getPlayerGamePlay(seat.userId.toString(),tableId);
        if (tempPlayer) {
          playerGamePlays.push(tempPlayer);
        }
      })
    );

    const playersInfo = playerGamePlays as defaulPlayerGamePlayInterface[];

    const activePlayersData = playersInfo.filter(
      (player) => player.userStatus === PLAYER_STATE.PLAYING
    );
    Logger.info(tableId,
      `Ending findActivePlayers for tableId : ${tableId} and round : ${currentRound}`
    );
    return activePlayersData;
  } catch (e) {
    Logger.error(tableId,'findActivePlayers error', e);
    throw new Error('findActivePlayers error');
  }
}

export = findActivePlayers;

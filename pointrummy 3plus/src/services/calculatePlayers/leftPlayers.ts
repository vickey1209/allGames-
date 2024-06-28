import { PLAYER_STATE } from '../../constants';
import { playerGamePlayCache } from '../../cache';
import { seatsInterface } from '../../interfaces/signup';
import { defaulPlayerGamePlayInterface } from '../../interfaces/playerGamePlay';
import Logger from "../../logger";

async function findLeftPlayers(
  seats: Array<seatsInterface>,
  tableId: string,
  currentRound: number
): Promise<Array<defaulPlayerGamePlayInterface>> {
  Logger.info(tableId,
    `Starting findLeftPlayers for tableId : ${tableId} and round : ${currentRound}`
  );

  const playerGamePlays: any[] = [];
  await Promise.all(
    seats.map(async (seat) => {
      const tempPlayer = await playerGamePlayCache.getPlayerGamePlay(seat.userId.toString(), tableId);

      if (tempPlayer) {
        playerGamePlays.push(tempPlayer);
      }
    })
  );

  const playersInfo = playerGamePlays as defaulPlayerGamePlayInterface[];
  const leftPlayersData = playersInfo.filter(
    (player) => player.userStatus === PLAYER_STATE.QUIT
  );
  Logger.info(tableId,
    `Ending findLeftPlayers for tableId : ${tableId} and round : ${currentRound}`
  );
  return leftPlayersData;
}

export = findLeftPlayers;

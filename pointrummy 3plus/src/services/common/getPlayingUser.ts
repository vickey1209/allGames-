
import { defaultTableGamePlayInterface } from '../../interfaces/tableGamePlay';
import { seatsInterface } from '../../interfaces/signup';

// function getPlayingUserInRound(
//   playerGamePlay: defaulPlayerGamePlayInterface[]
// ): defaulPlayerGamePlayInterface[] {
//   const activePlayersData: defaulPlayerGamePlayInterface[] =
//     playerGamePlay.filter(
//       (player) =>
//         player.userStatus === PLAYER_STATE.PLAYING ||
//         player.userStatus === PLAYER_STATE.DROP ||
//         player.userStatus === PLAYER_STATE.QUIT ||
//         player.userStatus === PLAYER_STATE.WATCHING || 
//         player.userStatus === PLAYER_STATE.WRONG_SHOW 
//     );

//   return activePlayersData;
// }

async function getPlayingUserInRound(
  tableGamePlay: defaultTableGamePlayInterface
): Promise<seatsInterface[]> {
  // const activePlayersData: defaulPlayerGamePlayInterface[] =
  const activePlayersData: seatsInterface[] = []
  for await (const seat of tableGamePlay.seats) {
    activePlayersData.push(seat)
  }

  return activePlayersData;
}

export { getPlayingUserInRound };

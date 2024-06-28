import { PLAYER_STATE } from '../../constants';
import { seatsInterface } from '../../interfaces/signup';

function getAllPlayingUser(
  seats: seatsInterface[]
): seatsInterface[] {
  const PlayersData: seatsInterface[] =
  seats.filter(
      (player) =>
        player.userState === PLAYER_STATE.PLAYING
    );

  return PlayersData;
}

export { getAllPlayingUser };
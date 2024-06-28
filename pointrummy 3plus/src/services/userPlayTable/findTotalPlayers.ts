import { seatsInterface } from '../../interfaces/signup';
import { defaultTableGamePlayInterface } from '../../interfaces/tableGamePlay';
import Logger from "../../logger"
import { userProfile } from '../../utils';

const findTotalPlayersCount = async (
  tableGamePlay: defaultTableGamePlayInterface,
  tableId: string,
): Promise<number> => {
  try {
    const filteredSeats = tableGamePlay.seats.filter(
      (seat: seatsInterface) => seat.userId
    );

    const playerInfoPromise = filteredSeats.map((seat: seatsInterface) =>
      userProfile.getUser({ _id: seat.userId })
    );

    const totalPlayers = await Promise.all(playerInfoPromise);
    const totalPlayersCount = totalPlayers.length;

    return totalPlayersCount;
  } catch (error: any) {
    Logger.error(tableId,error, 'function findTotalPlayersCount');
    throw new Error(error);
  }
};

export = findTotalPlayersCount;

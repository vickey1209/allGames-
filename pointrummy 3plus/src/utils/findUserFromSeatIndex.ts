import Logger from '../logger';
import { seatsInterface } from '../interfaces/signup';

async function findUserFromSeatIndex(
  seatIndex: number,
  playersDetail: Array<seatsInterface>,
  tableId: string,
): Promise<string> {
  try {
    const playerData = playersDetail.filter((player) => {
      return player.si === seatIndex;
    });
    return playerData[0].userId;
  } catch (e) {
    Logger.error(tableId,`Error in findUserFromSeatIndex`, e);
    throw new Error(`Error in findUserFromSeatIndex`);
  }
}

export = findUserFromSeatIndex;

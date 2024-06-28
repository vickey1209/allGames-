import Logger from "../../logger";
import redis from '../redisCommon';
import { REDIS } from '../../constants';
import { gameDetailsInterface } from '../../interfaces/turnHistory';

async function getTurnHistory(
  tableId: string
): Promise<Array<gameDetailsInterface> | null> {
  const key = `${REDIS.TURN_HISTORY}:${tableId}`;
  try {
    return redis.getValueFromKey<Array<gameDetailsInterface>>(key);
  } catch (e) {
    Logger.error(tableId,`Error in getTurnHistory for key ${key} `, e);
    return null;
  }
}

async function setTurnHistory(
  tableId: string,
  value: Array<gameDetailsInterface>
): Promise<boolean> {
  const key = `${REDIS.TURN_HISTORY}:${tableId}`;
  try {
    return await redis.setValueInKeyWithExpiry(key, value);
  } catch (e) {
    Logger.error(tableId,`Error in setTurnHistory for key ${key} `, e);
    return false;
  }
}

const deleteTurnHistory = (tableId: string) => {
  const key = `${REDIS.TURN_HISTORY}:${tableId}`;
  try {
    return redis.deleteKey(key);
  } catch (e) {
    Logger.error(tableId,`Error in deleteTurnHistory for key ${key}`, e);
    return false;
  }
};

const exportedObject = { getTurnHistory, setTurnHistory, deleteTurnHistory };

export = exportedObject;

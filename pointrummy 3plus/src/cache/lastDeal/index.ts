import Logger from "../../logger";
import redis from '../redisCommon';
import { REDIS } from '../../constants';
import { scoreBoardResponse } from "../../interfaces/tableConfig";

async function getLastDeal(
  userId: string
): Promise<scoreBoardResponse| null> {
  const key = `${REDIS.LAST_DEAL}:${userId}`;
  try {
    return redis.getValueFromKey<scoreBoardResponse>(key);
  } catch (e) {
    Logger.error(userId,`Error in getLastDeal for key ${key} `, e);
    return null;
  }
}

async function setLastDeal(
  userId: string,
  value: scoreBoardResponse
): Promise<boolean | any> {
  const key = `${REDIS.LAST_DEAL}:${userId}`;
  try {
    const res = await redis.setValueInKey(key, value);
    return res;
  } catch (e) {
    Logger.error(userId,`Error in setLastDeal for key ${key} `, e);
    return false;
  }
}

async function deleteLastDeal(userId: string){
  const key = `${REDIS.LAST_DEAL}:${userId}`;
  try {
    return redis.deleteKey(key);
  } catch (e) {
    Logger.error(userId,`Error in deleteLastDeal for key ${key}`, e);
    return false;
  }
};

const exportedObject = { getLastDeal, setLastDeal, deleteLastDeal };

export = exportedObject;

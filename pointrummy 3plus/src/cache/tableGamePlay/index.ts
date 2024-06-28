import Joi from 'joi';
import redis from '../redisCommon';
import { TableGamePlay } from '../../db';
import Logger from "../../logger";
import { REDIS, NUMERICAL } from '../../constants';
import { defaultTableGamePlayInterface } from '../../interfaces/tableGamePlay';

async function getTableGamePlay(
  tableId: string,
): Promise<defaultTableGamePlayInterface | null> {
  const key = `${REDIS.TABLE_GAME_PLAY}:${tableId}`;
  try {
    const tableGamePlay =
      await redis.getValueFromKey<defaultTableGamePlayInterface>(key);
    if (tableGamePlay) Joi.assert(tableGamePlay, TableGamePlay.joiSchema());

    return tableGamePlay;
  } catch (error) {
    Logger.error(tableId,`Error in getTableGamePlay for tableId ${tableId} and currentRound `, error);
    throw new Error("Error in getTableGamePlay for tableId"+error);
  }
}

async function insertTableGamePlay(
  tableGamePlay: defaultTableGamePlayInterface,
  tableId: string,
): Promise<boolean> {
  const key = `${REDIS.TABLE_GAME_PLAY}:${tableId}`;
  try {
    Joi.assert(tableGamePlay, TableGamePlay.joiSchema());
    const res = await redis.setValueInKeyWithExpiry(key, tableGamePlay);   
    return res;
  } catch (error) {
    Logger.error(tableId,`Error in insertTableGamePlay for tableId ${tableId} `, error);
    throw new Error("Error in insertTableGamePlay for tableId " + error);
  }
}

const deleteTableGamePlay = async (
  tableId: string,
): Promise<boolean> => {
  const key = `${REDIS.TABLE_GAME_PLAY}:${tableId}`;
  try {
    return redis.deleteKey(key);
  } catch (e) {
    Logger.error(tableId,`Error in deleteTableGamePlay for key ${key} `, e);
    return false;
  }
};

const exportObj = {
  getTableGamePlay,
  deleteTableGamePlay,
  insertTableGamePlay
};

export = exportObj;

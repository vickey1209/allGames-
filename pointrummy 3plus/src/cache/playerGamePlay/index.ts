import Joi from 'joi';
import Logger from "../../logger"
import redis from '../redisCommon';
import { REDIS } from '../../constants';
import { PlayerGamePlay } from '../../db';
import { defaulPlayerGamePlayInterface } from '../../interfaces/playerGamePlay';

const setPlayerGamePlay = async (
  key: string,
  obj: defaulPlayerGamePlayInterface
): Promise<boolean> => {
  try {
    Joi.assert(obj, PlayerGamePlay.joiSchema());
    const playerGamePlay = await redis.setValueInKeyWithExpiry(key, obj);
    return playerGamePlay;

  } catch (error) {
    Logger.error(`Error in setPlayerGamePlay for key ${key} and object ${JSON.stringify(obj)}`, error);
    throw new Error(`Error in setPlayerGamePlay for key ${key} and object ${JSON.stringify(obj)} Error :: ${error}`)
  }
};

const getPlayerGamePlay = async (
  userId: string,
  tableId: string
): Promise<defaulPlayerGamePlayInterface | null> => {
  const keyData = `${REDIS.PLAYER_GAME_PLAY}:${userId}:${tableId}`;
  try {
    const playerGamePlay =
      await redis.getValueFromKey<defaulPlayerGamePlayInterface>(keyData);
    if (playerGamePlay) Joi.assert(playerGamePlay, PlayerGamePlay.joiSchema());
    return playerGamePlay;
  } catch (error) {
    Logger.error(`Error in getPlayerGamePlay for key ${keyData}`, error);
    throw new Error(`Error in getPlayerGamePlay for key ${keyData} Error :: ${error}`)
  }
};

const deletePlayerGamePlay = async (
  userId: string,
  tableId: string
): Promise<boolean> => {
  const key = `${REDIS.PLAYER_GAME_PLAY}:${userId}:${tableId}`;
  try {
    return await redis.deleteKey(key);
  } catch (e) {
    Logger.error(`Error in deletePlayerGamePlay for key ${key} `, e);
    return false;
  }
};

async function insertPlayerGamePlay(
  playerGamePlay: defaulPlayerGamePlayInterface,
  tableId: string,
): Promise<boolean> {
  const key = `${REDIS.PLAYER_GAME_PLAY}:${playerGamePlay.userId}:${tableId}`;
  try {
    Joi.assert(playerGamePlay, PlayerGamePlay.joiSchema());
    const res = await redis.setValueInKeyWithExpiry(key, playerGamePlay);

    return res;
  } catch (error) {
    Logger.error(`Error in insertPlayerGamePlay for key ${key} `, error);
    throw new Error(`Error in insertPlayerGamePlay for key ${key} Error :: ${error}`)
  }
}

const exportedObject = {
  setPlayerGamePlay,
  getPlayerGamePlay,
  deletePlayerGamePlay,
  insertPlayerGamePlay
};
export = exportedObject;

import Joi from 'joi';
import redis from '../redisCommon';
import Logger from "../../logger";
import { REDIS } from '../../constants';
import { TableConfig } from '../../db';
import { defaultTableConfig } from '../../interfaces/tableConfig';

const setTableConfig = async (
  tableId: string,
  obj: defaultTableConfig
): Promise<boolean> => {
  const key = `${REDIS.GAME_TABLE}:${tableId}`;
  try {
    Joi.assert(obj, TableConfig.joiSchema());
    const res = await redis.setValueInKeyWithExpiry(key, obj);
    return res;
  } catch (error) {
    Logger.info(tableId,`Error in setTableConfig for key ${key} and object ${JSON.stringify(obj)} `, error);
    Logger.error(tableId,
      `Error in setTableConfig for key ${key} and object ${JSON.stringify(obj)} `, error
    );
    throw new Error(`Error in setTableConfig for key ${key} and object ${JSON.stringify(obj)} `);
  }
};

const getTableConfig = async (
  tableId: string
): Promise<defaultTableConfig | null> => {
  const key = `${REDIS.GAME_TABLE}:${tableId}`;
  try {
   
    const tableConfig = await redis.getValueFromKey<defaultTableConfig>(key);
    if (tableConfig) Joi.assert(tableConfig, TableConfig.joiSchema());
    return tableConfig;
  } catch (error) {
    Logger.error(tableId,`Error in getTableConfig for key ${key} `, error);
    throw new Error(`Error in getTableConfig for key ${key}, ERROR :: ${error}`)
  }
};

const deleteTableConfig = async (tableId: string): Promise<boolean> => {
  const key = `${REDIS.GAME_TABLE}:${tableId}`;
  try {
    return redis.deleteKey(key);
  } catch (e) {
    Logger.error(tableId,`Error in deleteTableConfig for key ${key} `, e);
    return false;
  }
};

const popTableFromQueue = async (key: string): Promise<string> => {
  return redis.popFromQueue<string>(key);
};

const pushTableFromQueue = async (key: string, tableId:string): Promise<string> => {
  return redis.pushIntoQueue<string>(key, tableId); 
}

const getTableFromQueue = async (key: string ): Promise<any> => {
  return await redis.getValueFromKey(`${REDIS.QUEUE}:${key}`); 
}

const setTableFromQueue = async (key: string, data:any): Promise<any> => {
  return await redis.setValueInKey(`${REDIS.QUEUE}:${key}`, data);
};



const exportedObject = {
  setTableConfig,
  getTableConfig,
  deleteTableConfig,
  popTableFromQueue,
  pushTableFromQueue,
  getTableFromQueue,
  setTableFromQueue

};
export = exportedObject;

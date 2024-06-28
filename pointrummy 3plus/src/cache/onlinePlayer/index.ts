import Logger from "../../logger";
import redis from '../redisCommon';
import { NUMERICAL, REDIS } from '../../constants';

async function decrCounter(
  onlinePlayer: string
): Promise<number| null> {
  const key = `${REDIS.ONLINE_USER_COUNTER}:${onlinePlayer}`;
  try {
    return redis.setDecrementCounter<number>(key);
  } catch (e) {
    Logger.error(`Error in decrCounter for key ${key} `, e);
    return null;
  }
}

async function incrCounter(
  onlinePlayer: string,
): Promise<boolean> {
  const key = `${REDIS.ONLINE_USER_COUNTER}:${onlinePlayer}`;
  try {
    return await redis.setIncrementCounter(key);
  } catch (e) {
    Logger.error(`Error in incrCounter for key ${key} `, e);
    return false;
  }
}

async function getOnliPlayerCount(onlinePlayer: string){
  const key = `${REDIS.ONLINE_USER_COUNTER}:${onlinePlayer}`;
  try {
    return await redis.getValueFromKey(key);
  } catch (e) {
    Logger.error(`Error in getOnliPlayerCount for key ${key}`, e);
    return false;
  }
};



async function getOnliPlayerCountLobbyWise(onlinePlayerLobby: string , lobbyId: string){
  try {
    const key = `${REDIS.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`;
    return await redis.getValueFromKey(key);
  } catch (error) {
    Logger.error('CATCH_ERROR :  getOnliPlayerCountLobbyWise', error);
    return false;
  }
}


async function setCounterIntialValue(onlinePlayer: string){
  try {
    let counter = NUMERICAL.ZERO;
    const key = `${REDIS.ONLINE_USER_COUNTER}:${onlinePlayer}`;
    return await redis.setValueInKey(key, counter);
  } catch (error) {
    Logger.error('CATCH_ERROR : setCounterIntialValue', error);
    return false;
  }
}

async function setCounterIntialValueLobby(onlinePlayerLobby: string, lobbyId: string){
  try {
    let counter = NUMERICAL.ZERO;
    const key = `${REDIS.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`;
    return await redis.setValueInKey(key, counter);
  } catch (error) {
    Logger.error('CATCH_ERROR :  setCounterIntialValueLobby', error);
    return false;
  }
}

async function removeOnliPlayerCountLobbyWise(onlinePlayerLobby: string , lobbyId: string){
  try {
    return redis.deleteKey(`${REDIS.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`);
  } catch (error) {
    Logger.error('CATCH_ERROR :  removeOnliPlayerCountLobbyWise', error);
    return false;
  }
}

async function incrCounterLobbyWise(onlinePlayerLobby: string , lobbyId: string){
  try {
    return redis.setIncrementCounter(`${REDIS.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`);
  } catch (error) {
    Logger.error("CATCH_ERROR : incrCounterLobbyWise", error)
    throw error
  }
}

async function decrCounterLobbyWise(onlinePlayerLobby: string , lobbyId: string){
  try {
    return redis.setDecrementCounter(`${REDIS.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`);
  } catch (error) {
    Logger.error("CATCH_ERROR : decrCounterLobbyWise", error)
    throw error
  }
}


const exportedObject = { 
  decrCounter, 
  incrCounter, 
  getOnliPlayerCount, 
  getOnliPlayerCountLobbyWise, 
  setCounterIntialValue, 
  setCounterIntialValueLobby,
  removeOnliPlayerCountLobbyWise,
  incrCounterLobbyWise,
  decrCounterLobbyWise
};

export = exportedObject;

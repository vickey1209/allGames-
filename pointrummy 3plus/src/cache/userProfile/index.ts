import Joi from 'joi';
import Logger from "../../logger"
import redis from '../redisCommon';
import  { UserProfile }  from '../../db';
import { REDIS } from '../../constants';
import { UserProfileOutput } from '../../interfaces/userProfile';

const setUserProfile = async (
  userId: string,
  obj: UserProfileOutput
): Promise<boolean> => {
  const key = `${REDIS.USER}:${userId}`;
  try {
    Joi.assert(obj, UserProfile.joiSchema());
    await redis.setValueInKey(key, obj);
    return true;
        
  } catch (error) {
    Logger.error(userId,
      `Error in setUserProfile for key ${key} and object ${JSON.stringify(obj)}`,
      error
    );
    throw new Error("set value key error")
  }
};

const getUserProfile = async (
  userId: string
): Promise<UserProfileOutput | null> => {
  const key = `${REDIS.USER}:${userId}`;
  try {
    const reqTimestamp = Date.now();
    const userProfile = await redis.getValueFromKey<UserProfileOutput>(key);
    if (userProfile) Joi.assert(userProfile, UserProfile.joiSchema());
      return userProfile;
  } catch (error) {
    Logger.error(userId,`Error in setUserProfile for key ${key}`, error);
    throw new Error("set value key error")

  }
};

const deleteUserProfile = async (userId: string): Promise<boolean> => {
  const key = `${REDIS.USER}:${userId}`;
  try {
    return redis.deleteKey(key);
  } catch (e) {
    Logger.error(userId,`Error in setUserProfile for key ${key} `, e);
    return false;
  }
};

const exportedObject = {
  setUserProfile,
  getUserProfile,
  deleteUserProfile
};

export = exportedObject;
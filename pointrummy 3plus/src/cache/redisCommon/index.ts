import { REDIS } from "../../constants";
import global from "../../global";

const setValueInKey = async <T>(key: string, Data:any): Promise<T | null> => {
    return new Promise(function(resolve, reject) {
        global.redisClient.set(key, JSON.stringify(Data), function(err:any, data:any){
            if(err)  
                reject(err);
            resolve(data);
        })
    })
}

const getValueFromKey = async <T>(key: string): Promise<T | null> => {
    return new Promise(function(resolve, reject) {
        global.redisClient.get(key, function(err:any, data:any){
            if(err)  
                reject(err);
            resolve(JSON.parse(data));
        })
    })
}

const deleteKey = async (key: string): Promise<boolean> => global.redisClient.del(key);

const setValueInKeyWithExpiry = async (key: string, obj: any ): Promise<boolean> => {
    const exp: number = 2*60*60;
    // const exp: number = 3*60;
    return global.redisClient.setex(key, exp, JSON.stringify(obj));
};


const pushIntoQueue = async <T>(key: string, element:any): Promise<T> => {
    return new Promise(function(resolve, reject) {
        global.redisClient.lpush(`${REDIS.QUEUE}:${key}`, JSON.stringify(element), function(err:any, data:any){
            if(err)  reject(err);
            resolve(JSON.parse(data));
        })
    })
}
    

const popFromQueue = async <T>(key: string): Promise<T> => {
  return new Promise(function(resolve, reject) {
      global.redisClient.lpop(`${REDIS.QUEUE}:${key}`, function(err:any, data:any){
          if(err)  reject(err);
          resolve(JSON.parse(data));
      })
  })
}

const setIncrementCounter = async <T>(key: string): Promise<T> => {
    return new Promise(function (resolve, reject) {
        global.redisClient.incr(`${key}`, function (err: any, data: any) {
            if (err) reject(err);
            resolve(JSON.parse(data));
        })
    })
}

const setDecrementCounter = async <T>(key: string): Promise<T> => {
    return new Promise(function (resolve, reject) {
        global.redisClient.decr(`${key}`, function (err: any, data: any) {
            if (err) reject(err);
            resolve(JSON.parse(data));
        })
    })
}


const exportObject = {
    setValueInKey,
    getValueFromKey,
    deleteKey,
    setValueInKeyWithExpiry,
    pushIntoQueue,
    popFromQueue,
    setIncrementCounter,
    setDecrementCounter
};

export = exportObject;
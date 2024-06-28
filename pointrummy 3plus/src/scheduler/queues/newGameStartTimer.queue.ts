const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
import { newGameStartTimerProcess } from "../processes/newGameStartTimer.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, REDIS_CONNECTION_URL, NODE_ENV } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};

let newGameStartTimerQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  newGameStartTimerQueue = new Bull('newGameStartTimer_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  newGameStartTimerQueue = new Bull(`newGameStartTimer_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function newGameStartTimer(data: any){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- newGameStartTimer ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer + 500, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
    await newGameStartTimerQueue.add(data, options);
    return newGameStartTimerQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

newGameStartTimerQueue.process(newGameStartTimerProcess);

// export = newGameStartTimer;
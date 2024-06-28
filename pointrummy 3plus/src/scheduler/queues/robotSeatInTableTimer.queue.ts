const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
import { robotSeatTimerProcess } from "../processes/robotSeatInTableTimer.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV, REDIS_CONNECTION_URL } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};

let robotSeatTimerQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  robotSeatTimerQueue = new Bull('robotSeatTimer_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  robotSeatTimerQueue = new Bull(`robotSeatTimer_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function robotSeatInTableTimer(data: any){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- robotSeatInTableTimer ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
    
    await robotSeatTimerQueue.add(data, options);
    return robotSeatTimerQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

robotSeatTimerQueue.process(robotSeatTimerProcess);

// export = robotSeatInTableTimer;
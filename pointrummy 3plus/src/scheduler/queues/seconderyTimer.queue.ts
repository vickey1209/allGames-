const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
import { seconeryTurnTimerProcess } from "../processes/seconderyTimer.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV, REDIS_CONNECTION_URL } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};


let seconderyTimerQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  seconderyTimerQueue = new Bull('seconderyTimerQueue_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  seconderyTimerQueue = new Bull(`seconderyTimerQueue_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function seconderyTimerStart(data: any){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- seconderyTimer ::=>> ${JSON.stringify(data)}`);
    
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
    await seconderyTimerQueue.add(data, options);
    return seconderyTimerQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

seconderyTimerQueue.process(seconeryTurnTimerProcess);

// export = seconderyTimer;

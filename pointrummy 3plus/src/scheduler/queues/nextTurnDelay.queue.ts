const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
import { nextTurnDelayProcess } from "../processes/nextTurnDelay.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV, REDIS_CONNECTION_URL } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};


let nextTurnDelayQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  nextTurnDelayQueue = new Bull('nextTurnDelay_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  nextTurnDelayQueue = new Bull(`nextTurnDelay_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function nextTurnDelay(data: any){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- nextTurnDelay ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer,
      jobId: data.jobId,
      removeOnComplete: true
    };
    await nextTurnDelayQueue.add(data, options);
    return nextTurnDelayQueue;
  } catch (error) {
    Logger.error(tableId,error,'error while');
  }
};

nextTurnDelayQueue.process(nextTurnDelayProcess);

// export = nextTurnDelay;

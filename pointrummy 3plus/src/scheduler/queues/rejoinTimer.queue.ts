const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import url from "url"
import { getConfig } from "../../config";
import { rejoinTimerProcess } from "../processes/rejoinTimer.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV, REDIS_CONNECTION_URL } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};

let rejoinTimerQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  rejoinTimerQueue = new Bull('rejoinTimer_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  rejoinTimerQueue = new Bull(`rejoinTimer_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}


export async function rejoinTimerStart(data: any){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- rejoinTimer ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
    await rejoinTimerQueue.add(data, options);
    return rejoinTimerQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

rejoinTimerQueue.process(rejoinTimerProcess);

// export = rejoinTimer;

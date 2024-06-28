const Bull = require('bull');
import Logger from "../../logger"
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
import { lockTimerStartProcess } from "../processes/lockTimerStart.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, REDIS_CONNECTION_URL, NODE_ENV } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};


let lockTimerStartQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  lockTimerStartQueue = new Bull('lockTimerStart_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  lockTimerStartQueue = new Bull(`lockTimerStart_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function lockTimerStart(data: any){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- lockTimerStart ::=>> ${JSON.stringify(data)}`);
        const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
       
    await lockTimerStartQueue.add(data, options);
    return lockTimerStartQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

lockTimerStartQueue.process(lockTimerStartProcess);

// export = lockTimerStart;
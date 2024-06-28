const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
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


export async function cancelRejoinTimer(jobId: any, tableId: string){
  try {
    
    Logger.info(tableId,"--- cancelRejoinTimer ==>>", jobId);
    const job = await rejoinTimerQueue.getJob(jobId);

    if (job !== null) {
      await job.remove();
      Logger.info(tableId,"job : cancelRejoinTimer :: success");
    }else{
      Logger.info(tableId,"===========>> cancelRejoinTimer :: JOB NOT AVAILABLE :: ");
    }
  } catch (e) {
    Logger.error(tableId,'cancelRejoinTimer', e);
  }
};

// export = cancelRejoinTimer;

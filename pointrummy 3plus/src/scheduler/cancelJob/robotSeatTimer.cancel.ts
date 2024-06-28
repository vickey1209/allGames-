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

let robotSeatTimerQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  robotSeatTimerQueue = new Bull('robotSeatTimer_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  robotSeatTimerQueue = new Bull(`robotSeatTimer_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function cancelrobotSeatTimer(jobId: any, tableId:string){
  try {
    Logger.info(tableId,`---- cancelrobotSeatTimer ::=>> ${jobId}`);

    const job = await robotSeatTimerQueue.getJob(jobId);
    if (job) {
      Logger.info(tableId,"job : cancelrobotSeatTimer :: success");
      await job.remove();
    }
  } catch (e) {
    Logger.error(tableId,'cancelrobotSeatTimer', e);
  }
};

// export = cancelrobotSeatTimer;
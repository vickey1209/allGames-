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
    password: String(REDIS_AUTH),
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

export async function cancelSeconderyTimer(jobId: any, tableId: string){
    try {
        const jobData = await seconderyTimerQueue.getJob(jobId);

        Logger.info(tableId,' cancelSeconderyTimer :: JOB CANCELLED  :: JOB ID:" ----', jobId);
        if (jobData) {
          await jobData.remove();
            Logger.info(tableId," cancelSeconderyTimer :: JOB AVAILABLE :: ");
        }
         else {
            Logger.info(tableId," cancelSeconderyTimer :: JOB NOT AVAILABLE :: ");
        }
    } catch (e) {
        Logger.error(tableId,'cancelSeconderyTimer', e);
    }
};

// export = cancelSeconderyTimer;
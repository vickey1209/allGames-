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

let scoreBoardTimerQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  scoreBoardTimerQueue = new Bull('StartScoreBoardTimer_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  scoreBoardTimerQueue = new Bull(`StartScoreBoardTimer_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function cancelScoreBoardTimer(jobId: any, tableId: string){
    try {
        const jobData = await scoreBoardTimerQueue.getJob(jobId);
        Logger.info(tableId,' cancelScoreBoardTimer :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
        if (jobData !== null) {
            Logger.info(tableId," cancelScoreBoardTimer :: JOB AVAILABLE :: ");
            await jobData.remove();
        } else {
            Logger.info(tableId," cancelScoreBoardTimer :: JOB NOT AVAILABLE :: ");
        }
    } catch (e) {
        Logger.error(tableId,'cancelScoreBoardTimer', e);
    }
};

// export = cancelScoreBoardTimer;
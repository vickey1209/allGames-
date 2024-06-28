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
  scoreBoardTimerQueue = new Bull('ScoreBoardTimer_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  scoreBoardTimerQueue = new Bull(`ScoreBoardTimer_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function cancelShowScoreBoardTimer(jobId: any,  tableId: String){
    try {
        const jobData = await scoreBoardTimerQueue.getJob(jobId);

        Logger.info(tableId,' cancelShowScoreBoardTimer :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
        Logger.info(tableId,' cancelShowScoreBoardTimer :: JOB CANCELLED :: JOB ID:" job ---- ', jobData);
        if (jobData !== null) {
            Logger.info(tableId," cancelShowScoreBoardTimer :: JOB AVAILABLE :: ");
            await jobData.remove();
        } else {
            Logger.info(tableId," cancelShowScoreBoardTimer :: JOB NOT AVAILABLE :: ");
        }
    } catch (e) {
        Logger.error(tableId,'cancelShowScoreBoardTimer', e);
    }
};

// export = cancelShowScoreBoardTimer;
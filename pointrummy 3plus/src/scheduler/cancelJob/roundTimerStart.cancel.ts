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

let roundTimerStartQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  roundTimerStartQueue = new Bull('roundTimerStart_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  roundTimerStartQueue = new Bull(`roundTimerStart_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function cancelRoundTimerStart(jobId: any, tableId: string){
    try {
        Logger.info(tableId,`---- cancelRoundTimerStart ::=>> ${jobId}`);
        const job = await roundTimerStartQueue.getJob(jobId);

        if (job) {
            Logger.info(tableId,"job : cancelrobotSeatTimer :: success");
            await job.remove();
        }
    } catch (e) {
        Logger.error(tableId,'cancelRoundTimerStart', e);
    }
};

// export = cancelRoundTimerStart;
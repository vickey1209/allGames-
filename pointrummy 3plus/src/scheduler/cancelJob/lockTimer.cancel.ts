const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, REDIS_CONNECTION_URL, NODE_ENV } = getConfig();

const SchedulerRedisConfig: RedisCred = {
    host: String(REDIS_HOST),
    port: Number(REDIS_PORT),
    db: Number(REDIS_DB),
    password: String(REDIS_AUTH),
};

let lockTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
    const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
    lockTimerQueue = new Bull('lockTimerStart_3Plus', { redis: { host: hostname, port: port, db: Number(REDIS_DB) } });
} else {
    lockTimerQueue = new Bull(`lockTimerStart_3Plus`, {
        redis: SchedulerRedisConfig,
    });
}

export async function cancelLockTimer (jobId: any, tableId: string){
    try {
        Logger.info(tableId, `---- cancelLockTimer :::=>> ${jobId}`);

        const job = await lockTimerQueue.getJob(jobId);
        if (job) {
            await job.remove();
            Logger.info(tableId, "job : cancelLockTimer :: success");
        }
    } catch (e) {
        Logger.error(tableId, 'cancelLockTimer', e);
    }
};

// export = cancelLockTimer;
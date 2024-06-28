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

let tossCardTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
    const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
    tossCardTimerQueue = new Bull('tossCardStart_3Plus', { redis: { host: hostname, port: port, db: Number(REDIS_DB) } });
} else {
    tossCardTimerQueue = new Bull(`tossCardStart_3Plus`, {
        redis: SchedulerRedisConfig,
    });
}

export async function cancelTossCardTimer(jobId: any, tableId: string){
    try {
        Logger.info(tableId, `---- cancelTossCardTimer ::=>> ${jobId}`);

        const job = await tossCardTimerQueue.getJob(jobId);
        if (job) {
            await job.remove();
            Logger.info(tableId, "job : cancelTossCardTimer :: success");
        }
    } catch (e) {
        Logger.error(tableId, 'cancelTossCardTimer', e);
    }
};

// export = cancelTossCardTimer;
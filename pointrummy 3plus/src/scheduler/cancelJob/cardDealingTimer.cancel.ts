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

let cardDealingTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
    const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
    cardDealingTimerQueue = new Bull('cardDealing_3Plus', { redis: { host: hostname, port: port, db: Number(REDIS_DB) } });
} else {
    cardDealingTimerQueue = new Bull(`cardDealing_3Plus`, {
        redis: SchedulerRedisConfig,
    });
}

export async function cancelCardDealingTimer (jobId: any, tableId: string){
    try {
        Logger.info(tableId, `---- cancelCardDealingTimer ::=>> ${jobId}`);

        const job = await cardDealingTimerQueue.getJob(jobId);
        if (job) {
            await job.remove();
            Logger.info(tableId, "job : cancelCardDealingTimer :: success");
        }
    } catch (e) {
        Logger.error(tableId, 'cancelCardDealingTimer', e);
    }
};

// export = cancelCardDealingTimer;
const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import url from "url"
import { getConfig } from "../../config";
import { bootCollectingStartTimerProcess } from "../processes/bootCollectingStartTimer.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, REDIS_CONNECTION_URL, NODE_ENV } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};

let bootCollectingStartQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  bootCollectingStartQueue = new Bull('bootCollectingStart_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB)} });
}else{
  bootCollectingStartQueue = new Bull(`bootCollectingStart_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function bootCollectingStartTimer(data: any){
  const tableId = data.tableId;
  try {

    Logger.info(tableId,`---- bootCollectingStartTimer ::=>> ${JSON.stringify(data)}`);
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
    await bootCollectingStartQueue.add(data, options);
    return bootCollectingStartQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

bootCollectingStartQueue.process(bootCollectingStartTimerProcess);

// export = bootCollectingStartTimer;

const Bull = require('bull');
import Logger from "../../logger"
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
import { watingForPlayerTimerStartProcess } from "../processes/watingForPlayerTimerStart.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV, REDIS_CONNECTION_URL } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};


let waitingForPlayerTimerStartQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  waitingForPlayerTimerStartQueue = new Bull('waitingForPlayerTimerStart_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  waitingForPlayerTimerStartQueue = new Bull(`waitingForPlayerTimerStart_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function waitingForPlayerTimerStart(data: any){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- waitingForPlayerTimerStart ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
       
    await waitingForPlayerTimerStartQueue.add(data, options);
    return waitingForPlayerTimerStartQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

waitingForPlayerTimerStartQueue.process(watingForPlayerTimerStartProcess);

// export = waitingForPlayerTimerStart;
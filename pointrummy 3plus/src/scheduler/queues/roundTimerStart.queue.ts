const Bull = require('bull');
import Logger from "../../logger"
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
import { roundTimerStartProcess } from "../processes/roundTimerStart.process";
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


export async function roundTimerStart(data: any){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- roundTimerStart ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
       
    await roundTimerStartQueue.add(data, options);
    return roundTimerStartQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

roundTimerStartQueue.process(roundTimerStartProcess);

// export = roundTimerStart;

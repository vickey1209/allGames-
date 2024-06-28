const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
import { daclarePlayerTurnTimerProcess } from "../processes/daclarePlayerTurnTimer.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV, REDIS_CONNECTION_URL } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};

let daclarePlayerTurnTimerQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  daclarePlayerTurnTimerQueue = new Bull('daclarePlayerTurnTimer_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  daclarePlayerTurnTimerQueue = new Bull(`daclarePlayerTurnTimer_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function declarePlayerTurnTimer(data: any){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- startDeclarePlayerTurnTimer ::=>> ${JSON.stringify(data)}`);
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
    };
    Logger.info(tableId,"options: ", options);
    
    await daclarePlayerTurnTimerQueue.add(data, options);
    return daclarePlayerTurnTimerQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

daclarePlayerTurnTimerQueue.process(daclarePlayerTurnTimerProcess);

// export = declarePlayerTurnTimer;

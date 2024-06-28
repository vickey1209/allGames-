const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import { playerTurnTimerIf } from "../../interfaces/SchedulerIf";
import url from "url"
import { playerTurnTimerProcess } from "../processes/playerTurnTimer.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV, REDIS_CONNECTION_URL } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};


let playerTurnTimerQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  playerTurnTimerQueue = new Bull('playerTurnTimer_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  playerTurnTimerQueue = new Bull(`playerTurnTimer_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function startPlayerTurnTimer(data: playerTurnTimerIf){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- startPlayerTurnTimer ::=>> ${JSON.stringify(data)}`);
    
    const options = {
      delay: data.timer + 500, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
    await playerTurnTimerQueue.add(data, options);
    return playerTurnTimerQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

playerTurnTimerQueue.process(playerTurnTimerProcess);

// export = startPlayerTurnTimer;

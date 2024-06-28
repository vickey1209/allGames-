const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
import { cardDealingProcess } from "../processes/cardDealing.process";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV, REDIS_CONNECTION_URL} = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};

let cardDealingQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  cardDealingQueue = new Bull('cardDealing_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  cardDealingQueue = new Bull(`cardDealing_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

export async function cardDealingStart(data: any){
  const tableId = data.tableId;
  try {
    Logger.info(tableId,`---- cardDealing ::=>> ${JSON.stringify(data)}`);
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
    await cardDealingQueue.add(data, options);
    return cardDealingQueue;
  } catch (error) {
    Logger.error(tableId,error);
  }
};

cardDealingQueue.process(cardDealingProcess);

// export = cardDealing;

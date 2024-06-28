// const Bull = require('bull');
// import Logger from "../../logger";
// import { RedisCred } from '../../interfaces/redis';
// import { getConfig } from "../../config";
// import { beforeScoreBoardTimerIf } from "../../interfaces/SchedulerIf";
// import url from "url"
// import { scoreBoardProcess } from "../processes/scoreBoardShowTimer.Process";
// const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV, REDIS_CONNECTION_URL } = getConfig();

// const SchedulerRedisConfig: RedisCred = {
//   host: String(REDIS_HOST),
//   port: Number(REDIS_PORT),
//   db: Number(REDIS_DB),
//   password : String(REDIS_AUTH),
// };

// let scoreBoardTimerQueue : any;
// if (NODE_ENV === "PRODUCTION") {
//   const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
//   scoreBoardTimerQueue = new Bull('ScoreBoardTimer_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
// }else{
//   scoreBoardTimerQueue = new Bull(`ScoreBoardTimer_3Plus`, {
//     redis: SchedulerRedisConfig,
//   });
// }

// const beforeScoreBoardTimer = async (data: beforeScoreBoardTimerIf) => {
//   const tableId = data.tableId;
//   try {
//     Logger.info(tableId,`---- beforeScoreBoardTimer ::=>> ${JSON.stringify(data)}`);

//     const options = {
//       delay: data.timer, // in ms
//       jobId: data.jobId,
//       removeOnComplete: true
//     };
//     await scoreBoardTimerQueue.add(data, options);
//     return scoreBoardTimerQueue;
//   } catch (error) {
//     Logger.error(tableId,error);
//   }
// };

// scoreBoardTimerQueue.process(scoreBoardProcess);

// export = beforeScoreBoardTimer;

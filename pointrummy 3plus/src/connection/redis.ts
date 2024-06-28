import global from "../global";
import { getConfig } from "../config";
import Logger from "../logger";
const redis = require('redis');
import url from "url"

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_AUTH,
  REDIS_DB,
  PUBSUB_REDIS_HOST,
  PUBSUB_REDIS_PORT,
  PUBSUB_REDIS_AUTH,
  PUBSUB_REDIS_DB,
  REDIS_CONNECTION_URL,
  NODE_ENV
} = getConfig();

let connectionsMap: any = null;

const connectionCallback = async () => {
  return new Promise(async (resolve, reject) => {

    console.log("REDIS_HOST ::",REDIS_HOST)
    console.log("PUBSUB_REDIS_HOST ::",PUBSUB_REDIS_HOST)

    let counter = 0;
    const redisConfig: {
      host: string;
      port: number;
      db: number;
      password?: string;
    } = {
      host: REDIS_HOST,
      port: REDIS_PORT,
      db: REDIS_DB,
    };

    const pubSubRedisConfig: {
      host: string;
      port: number;
      db: number;
      password?: string;
    } = {
      host: REDIS_HOST,
      port: REDIS_PORT,
      db: REDIS_DB,
    };

    if (REDIS_AUTH !== '') redisConfig.password = REDIS_AUTH;
    if (PUBSUB_REDIS_AUTH !== '')
      pubSubRedisConfig.password = REDIS_AUTH;

    Logger.info('redis data :: ', redisConfig);

    let client: any;
    let pubClient: any;
    if (NODE_ENV === "PRODUCTION") {

      console.log('PRODUCTION :: REDIS_CONNECTION_URL ::=>> ', REDIS_CONNECTION_URL);
      const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
      client = redis.createClient({ host : hostname, port : port, db : Number(REDIS_DB) });
      pubClient = redis.createClient({ host : hostname, port : port, db : Number(REDIS_DB) });

    } else {

      client = redis.createClient(redisConfig);
      pubClient = redis.createClient(pubSubRedisConfig);
      if (REDIS_DB !== "") {
        client.select(REDIS_DB);
        pubClient.select(REDIS_DB);
      }
      
    }

    const subClient = pubClient.duplicate();

    async function check() {
      if (counter === 2) {
        connectionsMap = { client, pubClient, subClient };
        global.redisClient = client;
        // client.flushdb(function (err: any, succeeded: any) {
        //   Logger.info("FLUSH-DB ==>>", succeeded);
        // });
        resolve(connectionsMap);
      }
    }

    client.on('ready', () => {
      Logger.info('Redis connected successfully.');
      // Redis.init(client);
      counter += 1;
      check();
    });

    client.on('error', (error: any) => {
      console.log("CATCH_ERROR : Redis Client error:", error)
      Logger.error('CATCH_ERROR : Redis Client error:', error);
      reject(error);
    });

    pubClient.on('ready', () => {
      Logger.info('pubClient connected successfully.');
      counter += 1;
      check();
    });

    pubClient.on('error', (error: any) => {
      Logger.error('CATCH_ERROR : pubClient Client error:', error);
      reject(error);
    });

    //  client.connect();
    //  pubClient.connect();

  });
}

const init = async () => connectionsMap || connectionCallback();

// export default { redisconnect: connect }
export default { redisconnect: init }
require('dotenv').config();
import Logger from './logger';


const processEnv = process.env;
let configData: any = null;

function getEnvJSON() {
  // Logger.info('env :::: ', env);

  const NODE_ENV = `NODE_ENV`;
  const PORT = 'PORT';
  const PROTOCOL = 'PROTOCOL'
  const REDIS_PORT = 'REDIS_PORT';
  const REDIS_HOST = 'REDIS_HOST';
  const REDIS_DB = 'REDIS_DB';
  const REDIS_AUTH = 'REDIS_AUTH';
  const REDIS_CONNECTION_URL = 'REDIS_CONNECTION_URL';


  const pubSubRedisHost = `PUBSUB_REDIS_HOST`;
  const pubSubRedisPort = `PUBSUB_REDIS_PORT`;
  const pubSubRedisPassword = `PUBSUB_REDIS_AUTH`;
  const pubSubRedisDb = `PUBSUB_REDIS_DB`

  const DB_PROTO = 'DB_PROTO';
  const DB_HOST = 'DB_HOST';
  const DB_PORT = 'DB_PORT';
  const DB_USERNAME = 'DB_USERNAME';
  const DB_PASSWORD = 'DB_PASSWORD';
  const DB_NAME = 'DB_NAME';
  const MONGO_SRV = 'MONGO_SRV';

  const HTTPS_KEY = 'HTTPS_KEY';
  const HTTPS_CERT = 'HTTPS_CERT';

  const GAME_ID = 'GAME_ID';
  const API_BASE_URL = 'API_BASE_URL';
  const VERIFY_USER_PROFILE = 'VERIFY_USER_PROFILE';
  const GET_USER_OWN_PROFILE = 'GET_USER_OWN_PROFILE';
  const DEDUCT_USER_ENTRY_FEE = 'DEDUCT_USER_ENTRY_FEE';
  const MULTI_PLAYER_SUBMIT_SCORE = 'MULTI_PLAYER_SUBMIT_SCORE';
  const GAME_SETTING_MENU_HELP = 'GAME_SETTING_MENU_HELP';
  const MARK_COMPLETED_GAME_STATUS = 'MARK_COMPLETED_GAME_STATUS';
  const GET_ONE_ROBOT = 'GET_ONE_ROBOT';
  const CHECK_BALANCE = 'CHECK_BALANCE';
  const REDIUS_CHECK = 'REDIUS_CHECK';
  const FTUE_UPDATE = 'FTUE_UPDATE';
  const CHECK_USER_BLOCK_STATUS = 'CHECK_USER_BLOCK_STATUS';
  const CHECK_MAINTANENCE = 'CHECK_MAINTANENCE';
  const APP_KEY = `APP_KEY`;
  const APP_DATA = `APP_DATA`;
  const SECRET_KEY = `SECRET_KEY`;

  const BUCKET_NAME = `BUCKET_NAME`;
  const REGION = `REGION`;
  const AWS_ACCESS_KEY = `AWS_ACCESS_KEY`;
  const AWS_SECRECT_KEY = `AWS_SECRECT_KEY`;
  const LOGS_SAVE_DAYS = `LOGS_SAVE_DAYS`;


  return Object.freeze({

    NODE_ENV: processEnv[NODE_ENV],
    PROTOCOL: processEnv[PROTOCOL],
    HTTP_SERVER_PORT: processEnv[PORT],
    REDIS_HOST: processEnv[REDIS_HOST],
    REDIS_AUTH: processEnv[REDIS_AUTH],
    REDIS_PORT: processEnv[REDIS_PORT],
    REDIS_DB: processEnv[REDIS_DB],
    REDIS_CONNECTION_URL: processEnv[REDIS_CONNECTION_URL],

    PUBSUB_REDIS_HOST: processEnv[pubSubRedisHost],
    PUBSUB_REDIS_PORT: processEnv[pubSubRedisPort],
    PUBSUB_REDIS_AUTH: processEnv[pubSubRedisPassword],
    PUBSUB_REDIS_DB: processEnv[pubSubRedisDb],

    DB_PROTO: processEnv[DB_PROTO],
    DB_HOST: processEnv[DB_HOST],
    DB_PORT: processEnv[DB_PORT],
    DB_USERNAME: processEnv[DB_USERNAME],
    DB_PASSWORD: processEnv[DB_PASSWORD],
    DB_NAME: processEnv[DB_NAME],
    MONGO_SRV: processEnv[MONGO_SRV],

    HTTPS_KEY: processEnv[HTTPS_KEY],
    HTTPS_CERT: processEnv[HTTPS_CERT],

    APP_KEY: processEnv[APP_KEY],
    APP_DATA: processEnv[APP_DATA],
    SECRET_KEY: processEnv[SECRET_KEY],

    // AWS credentials
    BUCKET_NAME: processEnv[BUCKET_NAME],
    REGION: processEnv[REGION],
    AWS_ACCESS_KEY: processEnv[AWS_ACCESS_KEY],
    AWS_SECRECT_KEY: processEnv[AWS_SECRECT_KEY],
    LOGS_SAVE_DAYS: processEnv[LOGS_SAVE_DAYS],

  
    // Client api
    GAME_ID: processEnv[GAME_ID],
    VERIFY_USER_PROFILE: `${processEnv[API_BASE_URL]}/gameServerApi/checkIsValidToken`,
    GET_USER_OWN_PROFILE: `${processEnv[API_BASE_URL]}/gameServerApi/getUsersOwnProfile`,
    DEDUCT_USER_ENTRY_FEE: `${processEnv[API_BASE_URL]}/gameServerApi/deductEntryFee`,
    MULTI_PLAYER_SUBMIT_SCORE: `${processEnv[API_BASE_URL]}/gameServerApi/multiPlayerSubmitScore`,
    GAME_SETTING_MENU_HELP: `${processEnv[API_BASE_URL]}/gameServerApi/getGameRules`,
    MARK_COMPLETED_GAME_STATUS: `${processEnv[API_BASE_URL]}/gameServerApi/markCompletedGameStatus`,
    GET_ONE_ROBOT: `${processEnv[API_BASE_URL]}/gameServerApi/getBot`,
    CHECK_BALANCE: `${processEnv[API_BASE_URL]}/gameServerApi/checkBalance`,
    REDIUS_CHECK: `${processEnv[API_BASE_URL]}/gameServerApi/getRadiusLocation`,
    FTUE_UPDATE: `${processEnv[API_BASE_URL]}/gameServerApi/userFirstTimeIntrection`,
    CHECK_USER_BLOCK_STATUS: `${processEnv[API_BASE_URL]}/gameServerApi/checkUserBlockStatus`,
    CHECK_MAINTANENCE: `${processEnv[API_BASE_URL]}/gameServerApi/checkMaintanence`,
    ADD_GAME_RUNNING_STATUS: `${processEnv[API_BASE_URL]}/gameServerApi/addRunningGameStatus`,
    MULTI_PLAYER_DEDUCT_ENTRY_FEE: `${processEnv[API_BASE_URL]}/gameServerApi/multiPlayerDeductEntryFee`,
    
    GAME_START_TIMER: 10000,
    NEXT_GAME_START_TIMER: 10000,
    LOCK_IN_TIMER: 5000,
    USER_TURN_TIMER: 30000,
    SECONDARY_TIMER: 15000,
    DECLARE_TIMER: 30000,
    BOOT_COLLECT_TIMER: 3000,
    TOSS_CARD_TIMER: 3000,
    CARD_DEALING_TIMER: 4500,
    REJOIN_TIMER: 60000,
    MORE_THEN_DISTANCE_TO_JOIN: 250,
    ROBOT_SEATNG_IN_TABLE_TIMER: 5000,
    NEW_GAME_START_TIMER: 10000,
    WAIT_FOR_OTHER_PLAYER_TIMER: 30000,
    IS_CLOCKWISE_TURN: false,
    MAXIMUM_TABLE_CREATE_LIMIT: 3,
    CONTINUE_MISSING_TURN_COUNT : 2

  });
  
}

function getConfig() {
  // const { NODE_ENV } = process.env;

  // if (NODE_ENV === 'LOCAL') {
  configData = getEnvJSON();
  Logger.info('start local server');
  // } else {
  //   Logger.info('start dev server');
  // }

  return configData;
}

const exportObject = { getConfig };
export = exportObject;

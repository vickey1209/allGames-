const { createLogger } = require("winston");
import { NUMERICAL } from "../constants";
import config from "./config/config";
import level from "./config/level";
import { formatLogMessages } from "./helper";
const winston = createLogger(config);

/**
 *
 * formats and logs message
 * @param {Number} type
 * @param  {...any} messages
 */

const logger = (type: any, ...messages: any) => {
  // console.log('message :==>> ', messages);
  const message = formatLogMessages(messages);

  // if (NODE_ENV == "STAGE" || NODE_ENV == "PRODUCTION") {
  //   const fs = require("fs");
  //   if (messages[0].length == 24) {
  //     fs.appendFile(
  //       `./logs/${messages[0]}.txt`,
  //       `${new Date().toISOString()} :: ${message}\n`,
  //       function (err: any) {
  //         // if (err) throw err;
  //       }
  //     );
  //   }
  // }

  let isLoganable = true;
  if (isLoganable) {
    switch (type) {
      case level.warn:
        winston.warn(message);
        break;

      case level.info:
        winston.info(message);
        break;

      case level.debug:
        winston.debug(message);
        break;

      case level.error:
        winston.error(message);
        break;

      // can throw error here TBD
      default:
        break;
    }
  }
  return { type, message };
};

export = logger;

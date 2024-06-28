import Logger from "../logger";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Redlock = require('redlock');

let redlock: any = null;

function registerRedlockError(): void {
  redlock.on('error', (error: any) => Logger.error('REDIS_LOCK_ERROR', error));
}

function initializeRedlock(redisClient: any): void {
    
  if (redlock) return redlock;

  redlock = new Redlock([redisClient], {
    // The expected clock drift; for more details see:
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time
    // ∞ retries
    retryCount: -1,
    // the time in ms between attempts
    retryDelay: 200, // time in ms
    // the max time in ms randomly added to retries
    // to improve performance under high contention
    retryJitter: 200, // time in ms
    // The minimum remaining time on a lock before an extension is automatically
    // attempted with the `using` API.
    automaticExtensionThreshold: 500 // time in ms
  });

  registerRedlockError();
  return redlock;
}

export default {
  init: initializeRedlock,
  getLock: () => redlock
};

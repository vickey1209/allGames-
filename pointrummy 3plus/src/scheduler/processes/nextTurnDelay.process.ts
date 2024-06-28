import Logger from "../../logger";
import commonEventEmitter from '../../commonEventEmitter';
import { NEXT_TURN_DELAY } from '../../constants/eventEmitter';

export async function nextTurnDelayProcess (job: any) {
  try {
    // console.log(' nextTurnDelayProcess :: job is ::', job.data);
    
    commonEventEmitter.emit(NEXT_TURN_DELAY, job.data);

    return job.data;
    
  } catch (e: any) {
    Logger.error(e);
    return undefined;
  }
};

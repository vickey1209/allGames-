import commonEventEmitter from '../../commonEventEmitter';
import { EVENTS, EVENT_EMITTER } from '../../constants';
import Logger from "../../logger";

export async function scoreBoardProcess(job: any){
  try {
    Logger.info("----->> Schuduler :: scoreBoardProcess :: Data ::",job.data);
    commonEventEmitter.emit(EVENT_EMITTER.EXPIRE_SCORE_BOARD_TIMER, job.data);
    return job.data;
    
  } catch (e: any) {
    Logger.error(e);
    return undefined;
  }
};

// export = scoreBoardProcess;
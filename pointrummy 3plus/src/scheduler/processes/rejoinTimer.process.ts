import commonEventEmitter from '../../commonEventEmitter';
import { PLAYER_REJOIN_TIMER_EXPIRED } from '../../constants/eventEmitter';
import Logger from "../../logger";

export async function rejoinTimerProcess(job: any){
  try {
    Logger.info("----->> Schuduler :: rejoinTimerProcess :: Data ::",job.data)

    commonEventEmitter.emit(PLAYER_REJOIN_TIMER_EXPIRED, job.data);

    return job.data;
    
  } catch (e) {
    Logger.error(e);
    return undefined;
  }
};

// export = rejoinTimerProcess;
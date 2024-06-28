import commonEventEmitter from '../../commonEventEmitter';
import { WAITING_FOR_PLAYER_TIMER_EXPIRED } from '../../constants/eventEmitter';
import Logger from "../../logger";

export async function watingForPlayerTimerStartProcess(job: any){
  try {
    Logger.info("----->> Schuduler :: watingForPlayerTimerStartProcess :: Data ::",job.data);

    commonEventEmitter.emit(WAITING_FOR_PLAYER_TIMER_EXPIRED, job.data);
    return job.data;
    
  } catch (e: any) {
    Logger.error(e);
    return undefined;
  }
};

// export = watingForPlayerTimerStartProcess;
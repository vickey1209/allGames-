import commonEventEmitter from '../../commonEventEmitter';
import { BOOT_COLLECTING_START_TIMER_EXPIRED } from '../../constants/eventEmitter';
import Logger from "../../logger"

export async function bootCollectingStartTimerProcess(job: any){
  try {
    Logger.info(' bootCollectingStartTimerProcess :: job is ::', job.data);

    commonEventEmitter.emit(BOOT_COLLECTING_START_TIMER_EXPIRED, job.data);

    return job.data;
    
  } catch (err: any) {
    Logger.error(err);
    return undefined;
  }
};

// export = bootCollectingStartTimerProcess;

import commonEventEmitter from '../../commonEventEmitter';
import { LOCK_IN_PERIOD_EXPIRED } from '../../constants/eventEmitter';
import Logger from "../../logger";

export async function lockTimerStartProcess(job: any){
  try {
    Logger.info(' lockTimerStartProcess :: job is ::', job.data);

    commonEventEmitter.emit(LOCK_IN_PERIOD_EXPIRED, job.data);

    return job.data;
    
  } catch (e) {
    Logger.error(e);
    return undefined;
  }
};

// export = lockTimerStartProcess;
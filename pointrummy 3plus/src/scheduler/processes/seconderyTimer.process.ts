import commonEventEmitter from '../../commonEventEmitter';
import { EXIRE_SECONDERY_TIMER } from '../../constants/eventEmitter';
import Logger from "../../logger";

export async function seconeryTurnTimerProcess(job: any){
  try {
    Logger.info("----->> Schuduler :: seconeryTurnTimerProcess :: Data ::",job.data);

    commonEventEmitter.emit(EXIRE_SECONDERY_TIMER, job.data);

    return job.data;

  } catch (e) {
    Logger.error(e);
    return undefined;
  }
};

// export = seconeryTurnTimerProcess;

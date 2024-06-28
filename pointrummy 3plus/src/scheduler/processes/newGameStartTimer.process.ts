import commonEventEmitter from '../../commonEventEmitter';
import { NEW_GAME_START_TIMER_EXPIRED } from '../../constants/eventEmitter';
import Logger from "../../logger";

export async function newGameStartTimerProcess(job: any){
  try {
    Logger.info(' newGameStartTimerProcess :: job is ::', job.data);

    commonEventEmitter.emit(NEW_GAME_START_TIMER_EXPIRED, job.data);
    return job.data;
    
  } catch (e) {
    Logger.error(e);
    return undefined;
  }
};

// export = newGameStartTimerProcess;

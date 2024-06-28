import commonEventEmitter from '../../commonEventEmitter';
import { DACLARE_PLAYER_TURN_TIMER_EXPIRED } from '../../constants/eventEmitter';
import Logger from "../../logger";

export async function daclarePlayerTurnTimerProcess(job: any){
  try {
    Logger.info(' daclarePlayerTurnTimerProcess :: job is ::', job.data);

    commonEventEmitter.emit(DACLARE_PLAYER_TURN_TIMER_EXPIRED, job.data);
    
    return job.data;

  } catch (e) {
    Logger.error(e);
    return undefined;
  }
};

// export = daclarePlayerTurnTimerProcess;
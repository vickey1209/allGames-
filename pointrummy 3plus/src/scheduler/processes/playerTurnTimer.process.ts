import commonEventEmitter from '../../commonEventEmitter';
import { PLAYER_TURN_TIMER_EXPIRED } from '../../constants/eventEmitter';
import Logger from "../../logger";

export async function playerTurnTimerProcess(job: any){
  try {
    Logger.info("----->> Schuduler :: playerTurnTimerProcess :: Data ::",job.data)
    commonEventEmitter.emit(PLAYER_TURN_TIMER_EXPIRED, job.data);

    return job.data;
    
  } catch (e) {
    Logger.error(e);
    return undefined;
  }
};

// export = playerTurnTimerProcess;

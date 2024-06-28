import commonEventEmitter from '../../commonEventEmitter';
import { ROBOT_SEATNG_IN_TABLE_EXPIRED } from '../../constants/eventEmitter';
import Logger from "../../logger";

export async function robotSeatTimerProcess(job: any){
  try {
    Logger.info("----->> Schuduler :: robotSeatTimerProcess :: Data ::",job.data)

    commonEventEmitter.emit(ROBOT_SEATNG_IN_TABLE_EXPIRED, job.data);

    return job.data;
    
  } catch (e) {
    Logger.error(e);
    return undefined;
  }
};

// export = robotSeatTimerProcess;
import commonEventEmitter from '../../commonEventEmitter';
import { TOSS_CARD_EXPIRED } from '../../constants/eventEmitter';
import Logger from "../../logger";

export async function tossCardStartProcess(job: any){
  try {
    Logger.info("----->> Schuduler :: tossCardStartProcess :: Data ::",job.data);
    
    commonEventEmitter.emit(TOSS_CARD_EXPIRED, job.data);

    return job.data;
    
  } catch (e: any) {
    Logger.error(e);
    return undefined;
  }
};

// export = tossCardStartProcess;
import commonEventEmitter from '../../commonEventEmitter';
import { CARD_DEALING_TIMER_EXPIRED } from '../../constants/eventEmitter';
import Logger from "../../logger";

export async function cardDealingProcess(job: any){
  try {
    Logger.info(' cardDealingProcess :: job is ::', job.data);
    
    commonEventEmitter.emit(CARD_DEALING_TIMER_EXPIRED, job.data);
    
    return job.data;

  } catch (e: any) {
    Logger.error(e);
    return undefined;
  }
};

// export = cardDealingProcess;

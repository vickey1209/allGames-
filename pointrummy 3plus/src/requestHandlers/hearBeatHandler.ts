import { EVENTS } from '../constants';
import CommonEventEmitter from '../commonEventEmitter';
import Logger from "../logger";

interface heartBeatI {
  heartBeat : string;
}

async function hearBeat(socket: any, data: heartBeatI): Promise<boolean> {
  const socketId = socket.id;
  try {
    
    CommonEventEmitter.emit(EVENTS.HEART_BEAT_SOCKET_EVENT, {
      socketId : socketId,
      data: data
    });

  } catch (error) {
    Logger.error(`hearBeat Error :: ${error}`)
  }

  return true;
}

export = hearBeat;

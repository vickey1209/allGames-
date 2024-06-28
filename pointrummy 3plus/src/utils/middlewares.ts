import { EVENTS } from "../constants";

// @ts-ignore
function ackMid(eventName, response, userId, tableId, ack) {
  try {
  
    if (response && 'tableId' in response && response.success)
      delete response.tableId;

    if(eventName != EVENTS.HEART_BEAT_SOCKET_EVENT){
      // console.log("acknowleadgement event ::==========================================>> ", eventName, JSON.stringify(response));
    }
    ack(
      JSON.stringify({
        eventName,
        success: true,
        data: response,
        userId,
        tableId,
      }),
    );
  } catch (error) {
    console.log('CATCH_ERROR in ackMid: ', error);
    // @ts-ignore
    throw new Error('ackMid error catch  : ', error);
  }
}

export = { ackMid };

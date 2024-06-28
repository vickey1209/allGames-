import Logger from "../../../logger"
import CommonEventEmitter from '../../../commonEventEmitter';
import { defaulPlayerGamePlayInterface } from "../../../interfaces/playerGamePlay";
import { UserProfileOutput } from "../../../interfaces/userProfile";
import { leaveClientInRoom } from "../../../socket";
import { decrCounterLobbyWise, getOnliPlayerCountLobbyWise, removeOnliPlayerCountLobbyWise } from "../../../cache/onlinePlayer";
import { EVENTS, NUMERICAL, REDIS, TABLE_STATE } from "../../../constants";
import { leaveTableResponse } from "../../../interfaces/inputOutputDataFormator";
import { formatLeaveTableData } from "../../../formatResponseData";

async function emitLeaveTableEvent(
  tableId: string,
  playerGamePlay: defaulPlayerGamePlayInterface,
  userProfile: UserProfileOutput,
  message: string,
  updatedUserCount: number,
  tableState: string,
  isLeaveEventSend: boolean,
  socketId: string
) {
  try {
    Logger.info(tableId, "isLeaveEventSend  :: >> ", isLeaveEventSend, "tableState :: ", tableState);
    if (!isLeaveEventSend) {
      await leaveClientInRoom(socketId, tableId);
    }


    // lobby wise user decrement count
    Logger.info("leaveTable :: decrCounterLobbyWise :: Call");
    await decrCounterLobbyWise(REDIS.ONLINE_PLAYER_LOBBY, userProfile.lobbyId);
    
    // const lobbyWiseCounter = await getOnliPlayerCountLobbyWise(REDIS.ONLINE_PLAYER_LOBBY, userProfile.lobbyId)
    // if (lobbyWiseCounter == NUMERICAL.ZERO) { await removeOnliPlayerCountLobbyWise(REDIS.ONLINE_PLAYER_LOBBY, userProfile.lobbyId) };

    const formatRemoveUserResponse: leaveTableResponse =
      await formatLeaveTableData(
        tableId,
        playerGamePlay,
        message,
        updatedUserCount,
        tableState
      );

    Logger.info(tableId, " formatRemoveUserResponse :: ", formatRemoveUserResponse);

    CommonEventEmitter.emit(EVENTS.LEAVE_TABLE_SOCKET_EVENT, {
      tableId: tableId,
      data: formatRemoveUserResponse,
      socketId: userProfile.socketId
    });

    return true;

  } catch (error) {
    Logger.error(tableId, `emitLeaveTableEvent Error :: ${error}`)
    Logger.info(tableId, "<<======= emitLeaveTableEvent() Error ======>>", error);
  }

}

export = emitLeaveTableEvent;
import Logger from "../../logger"
import CommonEventEmitter from '../../commonEventEmitter';
import {
  playerGamePlayCache,
  tableGamePlayCache,
  tableConfigCache,
} from '../../cache';
import { iamBackInputInterface } from '../../interfaces/iAmBack';
import { EVENTS, PLAYER_STATE, TABLE_STATE, EMPTY } from '../../constants';
import {
  formatGameTableData
} from '../../formatResponseData';
import { getUserProfile } from '../../cache/userProfile';
import { successRes } from '../../interfaces/signup';
import rejoinPopupManage from "./rejoinPopupManage";


async function iamBack(
  iamBackData: iamBackInputInterface,
  currentRound: number,
  socket: any
): Promise<successRes> {
  const { tableId } = iamBackData;
  const userId = socket.userId;
  const socketId = socket.id;
  try {
    Logger.info(tableId,
      `Starting iamBack for tableId : ${tableId} , userId : ${userId} and round : ${currentRound}`
    );

    const [playerGamePlay, tableGamePlay, tableConfig, userProfile] = await Promise.all([
      playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
      tableConfigCache.getTableConfig(tableId),
      getUserProfile(userId)
    ]);

    if (!tableGamePlay) throw Error('tableGamePlay not found !');
    if (!tableConfig) throw Error('tableConfig not found !');
    if (!userProfile) throw Error('user not found!');
    if (!playerGamePlay) throw Error('playerGamePlay not found !');


    Logger.info(tableId," tableGamePlay ==>>", tableGamePlay);
    Logger.info(tableId," tableConfig ==>>", tableConfig);
    Logger.info(tableId," userProfile ==>>", userProfile);
    Logger.info(tableId," playerGamePlay ==>>", playerGamePlay);
    
    playerGamePlay.playingStatus = EMPTY;
    await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);   

    const tableState: string = tableGamePlay?.tableState;
    if (tableState !== TABLE_STATE.WINNER_DECLARED && playerGamePlay.userStatus !== PLAYER_STATE.QUIT && playerGamePlay.userStatus !== PLAYER_STATE.WATCHING_LEAVE) {

      CommonEventEmitter.emit(EVENTS.ADD_PLAYER_IN_TABLE, {
        socketId: socket.id,
        data: { tableId, userId }
      });

      const formatedGTIResponse = await formatGameTableData(
        userProfile,
        tableConfig,
        tableGamePlay,
        playerGamePlay,
        true
      );

      Logger.info(tableId," iamBack : formatedGTIResponse :: ", formatedGTIResponse);

      CommonEventEmitter.emit(EVENTS.REJOIN_I_AM_BACK_SOCKET_EVENT, {
        socket,
        data: formatedGTIResponse,
        tableId
      });
    
      await rejoinPopupManage(userId, tableId, socketId);

    }

    Logger.info(tableId,
      `Ending iamBack for tableId : ${tableId} , userId : ${userId} and round : ${currentRound}`
    );
    return { success: true, error: null, tableId };
  } catch (error: any) {
    Logger.error(tableId,error, ` table ${tableId} user ${userId} round ${currentRound} function iamBack`);
    throw new Error(`INTERNAL_ERROR_iamBack() :: ${error}`);
  }
}
export = iamBack;

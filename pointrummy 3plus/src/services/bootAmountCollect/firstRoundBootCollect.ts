import Logger from "../../logger";
import {
  tableGamePlayCache,
  tableConfigCache,
} from '../../cache';
import { EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from '../../constants';
import CommonEventEmitter from '../../commonEventEmitter';
import { getAllPlayingUser } from "../common/getAllPlayingUser";
import Errors from "../../errors";


async function firstRoundBootCollect(
  tableId: string,
  currentRound: number
): Promise<boolean> {
  try {
    Logger.info(tableId, `Starting firstRoundBootCollect for tableId : ${tableId}`);
    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId)
    ]);
    if (!tableGamePlay || !tableConfig) throw Error('Unable to get table data');

    let collectBootValueSIArray = <Array<number>>[];
    tableGamePlay.seats.map((ele) => {
      if (ele.userState == PLAYER_STATE.PLAYING) {
        collectBootValueSIArray.push(ele.si);
      }
    })
    Logger.info(tableId, " collectBootValueSIArray :: ", collectBootValueSIArray);

    tableGamePlay.tableState = TABLE_STATE.COLLECTING_BOOT_VALUE;
    tableGamePlay.potValue = tableConfig.entryFee * tableGamePlay.currentPlayerInTable * NUMERICAL.EIGHTY;

    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    // let isentryFeeDeductManageData =  await entryFeeDeductManage(tableId, currentRound);

    const TGP = await tableGamePlayCache.getTableGamePlay(tableId);
    if (!TGP) { throw Error('Unable to get TGP data'); }

    const getAllPlayingPlayer = await getAllPlayingUser(TGP.seats);
    Logger.info(tableId, `roundDealerSetTimer getAllPlayingPlayer  :: `, getAllPlayingPlayer ); 
    Logger.info(tableId, `roundDealerSetTimer tableConfig.minPlayer  ::>> `, tableConfig.minPlayer ); 

    if(TGP.currentPlayerInTable < tableConfig.minPlayer || getAllPlayingPlayer.length < tableConfig.minPlayer /*|| !isentryFeeDeductManageData*/){
      return false;
    }
   
    // OLD FLOW : user wise entry fee deduct

    // for (let v = 0; v < tableGamePlay.seats.length; v++) {

    //   const userProfile = await userProfileCache.getUserProfile(tableGamePlay.seats[v].userId);
    //   if (!userProfile) throw Error('Unable to get data');

    //   if (tableGamePlay.seats[v].userState === PLAYER_STATE.PLAYING) {

    //     const apiData = {
    //       tableId,
    //       tournamentId: userProfile.lobbyId,
    //     }

    //     const debitAmountDetail = await wallateDebit(apiData, userProfile.authToken, userProfile.socketId);

    //     const userOwnProfile = await getUserOwnProfile(userProfile.authToken, userProfile.socketId, userProfile.userId);
    //     const updatedBalance: number = userOwnProfile.bonus + userOwnProfile.winCash + userOwnProfile.cash || 0;
    //     userProfile.balance = updatedBalance;
    //     await userProfileCache.setUserProfile(tableGamePlay.seats[v].userId, userProfile);

    //     const data = await formatBootCollectData(tableConfig, tableGamePlay, collectBootValueSIArray, updatedBalance, tableId);
    //     CommonEventEmitter.emit(EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT, {
    //       socket: userProfile.socketId,
    //       data,
    //       tableId
    //     });
    //   }

    // }

    Logger.info(tableId, `Ending firstRoundBootCollect for tableId : ${tableId}`);  
    return true;
  } catch (error: any) {

    Logger.error(tableId,
      error,
      ` table ${tableId} round ${currentRound} funciton firstRoundBootCollect`
    );

    let msg = MESSAGES.ERROR.COMMON_ERROR;
    let nonProdMsg = "";
    let errorCode = 500;

    if (error instanceof Errors.InvalidInput) {
        nonProdMsg = "Invalid Input";
        CommonEventEmitter.emit(EVENTS.SHOW_POPUP_ROOM_SOCKET_EVENT, {
            tableId: tableId,
            data: {
                isPopup: true,
                popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                title: nonProdMsg,
                message: msg,
                tableId,
                buttonCounts: NUMERICAL.ONE,
                button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
            },
        });
    } 

    throw new Error(`INTERNAL_ERROR_firstRoundBootCollect() ${error}`);
  }
}

export = firstRoundBootCollect;

import Logger from "../../logger";
import { RoundStartInterface } from '../../interfaces/gameStart';
import { EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../constants";
import { tableConfigCache, tableGamePlayCache } from "../../cache";
import { startUserTurn } from "../turn";
import Errors from "../../errors";
import CommonEventEmitter from '../../commonEventEmitter';
import { getAllPlayingUser } from "../common/getAllPlayingUser";


async function cardDealingTimer(
  cardDealData: RoundStartInterface
): Promise<boolean> {
  let { tableId, currentRound } = cardDealData;
  try {

    /** set here start Rummy game turn */
    Logger.info(tableId,`Starting user Turn start for tableId : ${tableId}`);

    const [tableGamePlay, tableConfig] = await Promise.all([
       tableGamePlayCache.getTableGamePlay(tableId),
       tableConfigCache.getTableConfig(tableId)
    ])
    if (!tableGamePlay || !tableConfig) {
      throw Error('Unable to get data at tableGamePlay or tableConfig');
    }

    Logger.info(tableId," cardDealingTimer :: tableGamePlay ::: >>", tableGamePlay);
    Logger.info(tableId," cardDealingTimer :: tableGamePlay.dealerPlayer ::: ", tableGamePlay.dealerPlayer);
    Logger.info(tableId," cardDealingTimer :: tableGamePlay.tossWinPlayer ::: ", tableGamePlay.tossWinPlayer);

    const getAllPlayingPlayer = await getAllPlayingUser(tableGamePlay.seats);
    Logger.info(tableId, `roundDealerSetTimer getAllPlayingPlayer  :: `, getAllPlayingPlayer ); 

    if(tableGamePlay.currentPlayerInTable < tableConfig.minPlayer || getAllPlayingPlayer.length < tableConfig.minPlayer){
      throw new Errors.InvalidInput("currentPlayerInTable is not more than two players")
    }

    if (tableGamePlay.tableState === TABLE_STATE.START_DEALING_CARD) {

      let turnSeat = 0;
      for (let i = 0; i < tableGamePlay.seats.length; i++) {
        const element = tableGamePlay.seats[i];
        if (tableGamePlay.tossWinPlayer == element.si && element.userState == PLAYER_STATE.PLAYING) {
          turnSeat = i;
          break;
        }
        else {
          for (let j = i + 1; j <= tableGamePlay.seats.length; j++) {
            Logger.info(tableId,'IN===> :>> ');
            const ele = tableGamePlay.seats[j];
            if (ele.userState == PLAYER_STATE.PLAYING) {
              turnSeat = j;
              break;
            }

            if (j === tableGamePlay.seats.length) {

              for (let j = 0; j < tableGamePlay.seats.length; j++) {
                Logger.info(tableId,'IN==12====> :>> ');
                const ele = tableGamePlay.seats[j];
                if (ele.userState == PLAYER_STATE.PLAYING) {
                  turnSeat = j;
                  break;
                }
              }
            }

          }
        }
      }

      Logger.info(tableId,'turnSeat :>> ', turnSeat);
      // (tableGamePlay.dealerPlayer < tableGamePlay.seats.length - 1) ? turnSeat = tableGamePlay.dealerPlayer + 1 : turnSeat    

      const userData = tableGamePlay.seats[turnSeat];

      tableGamePlay.tableState = TABLE_STATE.ROUND_STARTED;
      tableGamePlay.currentTurnSeatIndex = turnSeat;
      tableGamePlay.updatedAt = new Date().toString();
      tableGamePlay.isSeconderyTimer = false;
      
      Logger.info(tableId," userData ::: ", userData);
      if (!userData) { throw Error('Unable to get data at userData'); }

      startUserTurn(
        tableId,
        userData?.userId,
        userData?.si,
        tableGamePlay
      );
    }
    return false;
  } catch (error) {
    Logger.error(tableId,'cardDealingTimer error', error);

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

    throw new Error('cardDealingTimer error');
  }
}


export = cardDealingTimer;

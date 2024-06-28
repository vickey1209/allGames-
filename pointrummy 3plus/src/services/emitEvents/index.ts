import Logger from "../../logger"
import {
  formatJoinTableData,
  formatSignUpData
} from '../../formatResponseData';
import CommonEventEmitter from '../../commonEventEmitter';
import { EVENTS, NUMERICAL, TABLE_STATE } from '../../constants';
import { UserProfileOutput } from '../../interfaces/userProfile';
import { defaultTableConfig } from "../../interfaces/tableConfig";
import { defaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";
import { defaulPlayerGamePlayInterface } from '../../interfaces/playerGamePlay';
import { JTResponse, formatedJTResponse } from "../../interfaces/tableConfig";
import { diffSeconds } from "../../common";
import { getConfig } from "../../config";
import formatJoinTableSeats from "../nextRound/helper/formatJoinTableSeats";
import { removeQueue } from "../common/queue";
const { USER_TURN_TIMER, GAME_START_TIMER, WAIT_FOR_OTHER_PLAYER_TIMER, SECONDARY_TIMER, NEXT_GAME_START_TIMER } = getConfig();


const emitSignUpEvent = async (
  userProfile: UserProfileOutput,
  socketId: string
): Promise<boolean> => {
  const tableId = userProfile.tableId
  try {
    const formatedSignupResponse = await formatSignUpData(userProfile);
    Logger.info(tableId,"formatedSignupResponse ::  ", formatedSignupResponse);

    const emit = CommonEventEmitter.emit(EVENTS.SIGN_UP_SOCKET_EVENT, {
      socketId,
      data: formatedSignupResponse,
      tableId: undefined
    });
    return emit;
  } catch (e) {
    Logger.error(tableId,'emitSignUpEvent error', e);
    throw new Error('emitSignUpEvent error');
  }
};

// const emitGameTableInfoEvent = async (
//   tableConfig: defaultTableConfig,
//   tableGamePlay: defaultTableGamePlayInterface,
//   playerGamePlay: defaulPlayerGamePlayInterface,
//   socketId: string
// ): Promise<boolean> => {
//   try {
//     const formatedGTIResponse = await formatGameTableData(
//       tableConfig,
//       tableGamePlay,
//       playerGamePlay
//     );

//     const emit = CommonEventEmitter.emit(EVENTS.GAME_TABLE_INFO_SOCKET_EVENT, {
//       socketId,
//       data: formatedGTIResponse,
//       tableId: tableConfig._id
//     });

//     return emit;
//   } catch (e) {
//     Logger.error('emitGameTableInfoEvent error', e);
//     throw new Error('emitGameTableInfoEvent error');
//   }
// };

const emitJoinTableEvent = async (
  tableId: string,
  tableGamePlay: defaultTableGamePlayInterface,
  tableConfig: defaultTableConfig,
  userProfile: UserProfileOutput,
  socketId: string,
  reconnect: boolean,
  playerGamePlay: defaulPlayerGamePlayInterface,
): Promise<boolean> => {
  try {

    // const alreadyAvauilableInTable = tableGamePlay.seats.filter((seat) => seat.userId === userProfile.userId)

    // if (alreadyAvauilableInTable.length > NUMERICAL.ONE) {

    //   const seatsNewDetails: seatsInterface[] = [];
    //   let count = NUMERICAL.ZERO
    //   let seatIndex: number = -1;

    //   for await (const seat of tableGamePlay.seats) {
    //     if (seat.userId === userProfile.userId) {
    //       count += NUMERICAL.ONE;
    //       if (count === NUMERICAL.ONE) {
    //         seatsNewDetails.push(seat)
    //         seatIndex = seat.si
    //       }
    //     }
    //   }

    //   tableGamePlay.seats = seatsNewDetails;
    //   playerGamePlay.seatIndex = seatIndex;

    //   await insertPlayerGamePlay(playerGamePlay, tableId)
    //   await insertTableGamePlay(tableGamePlay, tableId)

    // }

    const formatedJoinTableResponse: any = [];
    const userId = userProfile.id;

    for (let i = 0; i < tableGamePlay.seats.length; i++) {
      const element = tableGamePlay.seats[i];

      let resFormet: JTResponse = await formatJoinTableData(element, reconnect, element.userState);
      formatedJoinTableResponse.push(resFormet);
      
    }

    // let totalTurnTimer: number = NUMERICAL.THIRTY;
    let rTimer: number = NUMERICAL.THIRTY;
    // if (tableGamePlay.isSeconderyTimer) {
    //   totalTurnTimer = 15
    // }
    if (tableGamePlay.tableState === TABLE_STATE.ROUND_STARTED) {
      if (tableGamePlay.isSeconderyTimer) {
        rTimer = diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
        rTimer = Math.ceil(Number(SECONDARY_TIMER) - rTimer) / NUMERICAL.THOUSAND;
      } else {
        rTimer = diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
        rTimer = Math.ceil(Number(USER_TURN_TIMER) - rTimer) / NUMERICAL.THOUSAND;
      }
    }

    let totalRoundTimer: number = NUMERICAL.MINUS_ONE;
    if (tableGamePlay.currentPlayerInTable > tableConfig.minPlayer) {

      // if (tableGamePlay.tableState === TABLE_STATE.WAITING_FOR_PLAYERS){
      //   totalRoundTimer =
      //     diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
      //     Logger.info("===bedore::::", totalRoundTimer);
      //     totalRoundTimer = Math.ceil((Number(WAITING_FOR_PLAYER) - rTimer) + Number(GAME_START_TIMER))  / NUMERICAL.THOUSAND;
      // }

      if (tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED){
        if(!tableGamePlay.isnextRound || tableConfig.noOfPlayer === NUMERICAL.TWO){
          totalRoundTimer = diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
          totalRoundTimer = Math.ceil(Number(GAME_START_TIMER) - totalRoundTimer) / NUMERICAL.THOUSAND;
        }
        else{
          totalRoundTimer = diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
          totalRoundTimer = Math.ceil(Number(NEXT_GAME_START_TIMER) - totalRoundTimer) / NUMERICAL.THOUSAND;
        }
      }
      // if (tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED) {
      //   totalRoundTimer =
      //     diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
      //   Logger.info(tableId," before :: totalRoundTimer :: ", totalRoundTimer);
      //   totalRoundTimer = Math.ceil((Number(GAME_START_TIMER) - totalRoundTimer)) / NUMERICAL.THOUSAND;
      // }
      else if (tableGamePlay.tableState === TABLE_STATE.WAIT_FOR_OTHER_PLAYERS) {
        totalRoundTimer =
          diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
        Logger.info(tableId," before :: totalRoundTimer :: ", totalRoundTimer);
        totalRoundTimer = Math.ceil((Number(WAIT_FOR_OTHER_PLAYER_TIMER) - totalRoundTimer)) / NUMERICAL.THOUSAND;
      }
      Logger.info(tableId," FINAL totalRoundTimer >>", totalRoundTimer);
    }

    let isRemainSeconderyTurns = false;
    if (playerGamePlay.seconderyTimerCounts < NUMERICAL.FOUR) {
      isRemainSeconderyTurns = true
    }

    const addJoinTableData = await formatJoinTableSeats(formatedJoinTableResponse, tableConfig.noOfPlayer,tableId)
    Logger.info(tableId," addJoinTableData :: ==>>", addJoinTableData);
    if(formatedJoinTableResponse.length === tableConfig.noOfPlayer) { await removeQueue(tableId); }
    
    let formatedJTResponse: formatedJTResponse = {
      tableId,
      entryFee: tableConfig.entryFee,
      jointTable: addJoinTableData,
      tableState: tableGamePlay.tableState,
      totalRoundTimer,
      dealerPlayer: tableGamePlay.dealerPlayer,
      validDeclaredPlayerSI: tableGamePlay.validDeclaredPlayerSI,
      validDeclaredPlayer: tableGamePlay.validDeclaredPlayer,
      currentTurnSeatIndex: tableGamePlay.currentTurnSeatIndex,
      currentTurn: tableGamePlay.currentTurn,
      totalUserTurnTimer: tableConfig.userTurnTimer / NUMERICAL.THOUSAND,
      userTurnTimer: rTimer,
      totalUserSeconderyTimer: Number(SECONDARY_TIMER / NUMERICAL.THOUSAND),
      trumpCard: tableGamePlay.trumpCard,
      opendDeck: tableGamePlay.opendDeck,
      finishDeck: tableGamePlay.finishDeck,
      closedDeck: tableGamePlay.closedDeck,
      isSeconderyTimer: tableGamePlay.isSeconderyTimer,
      isRemainSeconderyTurns: isRemainSeconderyTurns
    }
    Logger.info(tableId," formatedJTResponse ::: ", formatedJTResponse);


    // Join Room 
    let data = await CommonEventEmitter.emit(EVENTS.ADD_PLAYER_IN_TABLE, {
      socketId,
      data: { tableId, userId }
    });

    //join table emit
    await CommonEventEmitter.emit(EVENTS.JOIN_TABLE_SOCKET_EVENT, {
      tableId,
      data: formatedJTResponse
    });

    return true;


  } catch (e: any) {
    Logger.error(tableId,'emitJoinTableEvent error', e);
    throw new Error(e);
  }
};


const exportObj = {
  emitSignUpEvent,
  // emitGameTableInfoEvent,
  emitJoinTableEvent,
};

export = exportObj;

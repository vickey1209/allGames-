const { ObjectID } = require("mongodb")
import {
  NUMERICAL,
  TABLE_STATE,
  PLAYER_STATE,
  EMPTY
} from '../constants';
import {
  UserProfileDataInput,
  UserProfileOutput
} from '../interfaces/userProfile';
import { CreateTableI } from "../interfaces/signup";
import { defaultTableConfig } from '../interfaces/tableConfig';
import {
  defaultTableGamePlayInterface
} from '../interfaces/tableGamePlay';
import { defaulPlayerGamePlayInterface } from '../interfaces/playerGamePlay';
import { GetRandomInt } from "../common";
const { ObjectId } = require("mongodb");
import { getConfig } from "../config";
const { GAME_START_TIMER, USER_TURN_TIMER, SECONDARY_TIMER, DECLARE_TIMER  } = getConfig();

function defaultUserProfile(userData: UserProfileDataInput): UserProfileOutput {
  const currentTimestamp = new Date().toString();
  return {
    id: userData.userId
      ? userData.userId.toString()
      : ObjectId().toString(),
    username: (!userData.username)
      ? `Guest${GetRandomInt(1, 99999999)}`
      : userData.username,
    userId: userData.userId
      ? userData.userId.toString()
      : ObjectId().toString(), // (userData.ID) ? userData.ID : userId,
    profilePic: userData.profilePic, // profile picture,
    // isRejoin: false, // rejoinId
    tableId: EMPTY,
    tableIds: [],
    socketId: userData.socketId,
    noOfPlayer : userData.noOfPlayer,
    isUseBot : userData.isUseBot || false,
    isFTUE : userData.isFTUE || false,
    gameId: userData.gameId,
    isRobot : false,
    lobbyId: userData.lobbyId,
    entryFee : Number(userData.entryFee),
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
    authToken : userData.authToken,
    isAnyRunningGame : userData.isAnyRunningGame,
    longitude : userData.longitude || "0",
    latitude : userData.latitude || "0",
    balance : userData.balance,
    oldTableId : [],
    gameType : userData.gameType
  };
}

function defaulTableData(signUpData: CreateTableI): defaultTableConfig {
  const currentTimestamp = new Date();
  return {
    _id: ObjectID().toString(),     /*String(GetRandomInt(1000000000, 9999999999)),*/
    gameType: signUpData.gameType,
    currentRound: NUMERICAL.ONE,
    lobbyId: signUpData.lobbyId,
    gameId : signUpData.gameId,
    multiWinner: false,
    maximumPoints: NUMERICAL.EIGHTY,
    minPlayer: signUpData.minPlayer || NUMERICAL.TWO,
    noOfPlayer: signUpData.noOfPlayer,
    gameStartTimer: Number(GAME_START_TIMER),
    userTurnTimer: Number(USER_TURN_TIMER),
    secondaryTimer: Number(SECONDARY_TIMER),
    declareTimer: Number(DECLARE_TIMER),
    entryFee: signUpData.entryFee,
    moneyMode : signUpData.moneyMode,
    numberOfDeck : NUMERICAL.TWO,
    createdAt: currentTimestamp.toString(),
    updatedAt: currentTimestamp.toString(),
  };
}

function defaultTableGamePlayData(
 gameType : string
): defaultTableGamePlayInterface {
  const currentTimestamp = new Date();
  const data = {
    _id: ObjectID().toString(),      /*String(GetRandomInt(1000000000, 9999999999)),*/
    trumpCard: [],
    closedDeck: [],
    opendDeck: [],
    finishDeck: [],
    turnCount : NUMERICAL.ZERO,
    tossWinPlayer : NUMERICAL.MINUS_ONE,
    dealerPlayer: NUMERICAL.MINUS_ONE,
    declareingPlayer: EMPTY,
    validDeclaredPlayer: EMPTY,
    validDeclaredPlayerSI: NUMERICAL.ZERO,
    finishCount: [],
    isTurn : false,
    isnextRound : false,
    discardedCardsObj: [],
    potValue: NUMERICAL.ZERO,
    currentTurn: EMPTY,
    totalPickCount : NUMERICAL.ZERO,
    currentTurnSeatIndex: NUMERICAL.MINUS_ONE,
    currentPlayerInTable: NUMERICAL.ZERO,
    tableState: TABLE_STATE.WAITING_FOR_PLAYERS,
    seats: [],
    tableCurrentTimer: NUMERICAL.ZERO,
    gameType: gameType,
    isSeconderyTimer:false,
    createdAt: currentTimestamp.toString(),
    updatedAt: currentTimestamp.toString(),

  };
  return data
}

function defaulPlayerGamePlayData(
  userId: string,
  seatIndex: number,
  username: string,
  profilePic: string,
  userStatus : string,
): defaulPlayerGamePlayInterface {
  const currentTimestamp = new Date();
  return {
    _id: ObjectID().toString(),
    userId,
    username,
    profilePic,
    seatIndex,
    userStatus: (userStatus) ? userStatus : PLAYER_STATE.WATCHING,
    playingStatus : EMPTY,
    tCount: NUMERICAL.ZERO,
    cardPoints: NUMERICAL.ZERO,
    lastPickCard: EMPTY,
    pickFromDeck : EMPTY,
    currentCards: [],
    groupingCards: {
      pure: [],
      impure: [],
      set: [],
      dwd: [],
    },
    turnTimeOut: NUMERICAL.ZERO,
    seconderyTimerCounts: NUMERICAL.ZERO,
    // useRejoin: isRejoin || false,
    winningCash: NUMERICAL.ZERO,
    looseingCash: NUMERICAL.ZERO,
    isDropAndMove : false,
    dropScore : NUMERICAL.MINUS_ONE,
    createdAt: currentTimestamp.toString(),
    updatedAt: currentTimestamp.toString(),
    ispickCard : false,

  };
}


const exportedObject = {
  defaultUserProfile,
  defaulTableData,
  defaultTableGamePlayData,
  defaulPlayerGamePlayData
};

export = exportedObject;

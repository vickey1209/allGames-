import { defaultTableGamePlayInterface } from '../interfaces/tableGamePlay';
import { defaultTableConfig } from '../interfaces/tableConfig';

export interface defaulPlayerGamePlayInterface {
  _id: string;
  userId : string;
  username : string;
  profilePic : string
  seatIndex : number;
  userStatus: string;
  playingStatus :string;
  tCount: number;
  cardPoints: number;
  lastPickCard: string;
  pickFromDeck : string,
  currentCards: Array<any>;
  groupingCards: pairDataInterface
  turnTimeOut: number;
  seconderyTimerCounts : number;
  // useRejoin: boolean;
  winningCash: number;
  looseingCash: number;
  isDropAndMove : boolean;
  dropScore : number;
  ispickCard : boolean;
  createdAt: string;
  updatedAt: string;
}

export interface pairDataInterface {
  pure: Array<Array<string>>;
  impure: Array<Array<string>>;
  set: Array<Array<string>>;
  dwd: Array<Array<string>>;
}


export interface InsertPlayerInTableInterface {
  tableGamePlay: defaultTableGamePlayInterface;
  playerGamePlay: defaulPlayerGamePlayInterface;
  tableConfig: defaultTableConfig;
}

export interface seatPlayerInterface {
  si: number;
  points: number;
  name: string;
  pp: string;
  state: string;
  UserId: string;
}


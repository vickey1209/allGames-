import { cards } from './inputOutputDataFormator';
import { seatsInterface } from './signup';

export interface discardedCardsObjInterface {
  userId: string;
  card: string;
  seatIndex: number;
}

export interface defaultTableGamePlayInterface {
  _id: string;
  trumpCard: Array<string>;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  finishDeck: Array<string>;
  turnCount : number;
  tossWinPlayer : number;
  dealerPlayer: number;
  declareingPlayer: string;
  validDeclaredPlayer: string;
  validDeclaredPlayerSI:number;
  finishCount:Array<string>;
  isTurn:boolean;
  isnextRound : boolean;
  discardedCardsObj : Array<discardedCardsObjInterface>; 
  potValue: number;
  currentTurn: string;
  totalPickCount : number;
  currentPlayerInTable: number;
  currentTurnSeatIndex:number;
  tableState:string;
  seats: Array<seatsInterface>;
  tableCurrentTimer: any;
  gameType:string;
  isSeconderyTimer:boolean;
  createdAt:string;
  updatedAt:string;

}

export interface DefaultBaseTable {
  tableState: string;
  seats: Array<seatsInterface>;
}
export interface popupDataIf {
  msg: string;
}

export interface GTIResponse {
  isSeconderyTimer : boolean;
  isRemainSeconderyTurns : boolean;
  tableId: string;
  userId : string;
  seatIndex: number;
  name : string;
  userState : string;
  pp : string;
  pts : number;
  cardCount : number;
  cards : Array<cards>;
  bv: number;
  chips : string;
  tableState: string;
  totalPlayers: number;
  time: number;
  currentTurnUserId :string;
  currentTurnSeatIndex: number;
  DLR: number;
  playersDetail: Array<seatsInterface>;
  reconnect?: boolean;
  totalUserTurnTimer : number;
  totalUserSeconderyTimer : number;
  trumpCard: Array<string>;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  finishDeck: Array<string>;
  declareStatus : string;
  validDeclaredPlayer : string;
  validDeclaredPlayerSI : number;
  declareingPlayersSI : Array<number>;
  popupData : popupDataIf

}

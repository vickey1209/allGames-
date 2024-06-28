import { cards } from "./inputOutputDataFormator";
import { seatsInterface } from "./signup";
import { userObjInterface } from "./winner";

export interface defaultTableConfig {
  _id: string;
  gameType: string;
  currentRound: number;
  lobbyId: string;
  gameId : string;
  multiWinner: boolean;
  maximumPoints: number;
  minPlayer: number;
  noOfPlayer: number;
  gameStartTimer: number;
  userTurnTimer: number;
  secondaryTimer: number;
  declareTimer: number;
  entryFee: number;
  moneyMode : string;
  numberOfDeck : number;
  createdAt: string;
  updatedAt: string;
}

interface profileI {
  userId: string;
  username: string;
}

export interface playersDetailsInterface {
  profile: profileI;
  seatIndex: number;
  points: number;
  userStatus: string;
}

export interface NewGTIResponse {
  tableId: string;
  seatIndex: number;
  gameType: string;
  entryFee: string;
  maximumSeat: number;
  minimumSeat: number;
  activePlayers: number;
  gameStartTimer: number;
  turnTimer: number;
  tableState: string;
  turnCount : number;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  dealerPlayer: number;
  declareingPlayer: string;
  validDeclaredPlayer:string;
  validDeclaredPlayerSI : number;
  playersDetail: Array<seatsInterface>;
  reconnect? : boolean;
}
export interface JTResponse {
  si: number;
  userId: string;
  rejoin?: boolean;
  name: string;
  pp: string;
  userState : string;
}

export interface formatedJTResponse {
  tableId: string;
  entryFee : number;
  jointTable: Array<any>;
  tableState : string;
  totalRoundTimer : number;
  dealerPlayer: number;
  validDeclaredPlayerSI: number;
  validDeclaredPlayer: string;
  currentTurnSeatIndex: number;
  currentTurn: any;
  totalUserTurnTimer : number;
  userTurnTimer : number;
  totalUserSeconderyTimer : number;
  trumpCard: Array<string>
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  finishDeck: Array<string>;
  isSeconderyTimer:boolean;
  isRemainSeconderyTurns:boolean;
}

export interface BootCollectResponse {
  updatedUserWallet : string;
  bv: number;
  tbv: number;
  collectBootValueSIArray : number[],
  tableId : string;
}

export interface winnerResponse {
  winnerUserId: string;
  winnerSI: number;
  tableId: string;
  currentRound: number;
  totalUsers: Array<userObjInterface>
  tbv: number;
}


export interface userResDataInterface {
  userId: string;
  si: number;
  pp: string;
  userName: string;
  amount: string;
  cards: Array<cards>;
  score: number;
  result: string;
  isDeclared : boolean;
}


export interface scoreBoardResponse {
  tableId: string;
  isScoreBoardShow : boolean;
  scoreBoardTable: Array<userResDataInterface>;
  trumpCard: string[],
  timer : number;
  isNewGameStart : boolean;
}


export interface RejoinResponse {
  tableId: string;
  userId: string;
  seatIndex: number;
  name: string;
  pp: string;
  pts: number;
  cardCount: number;
  cards: Array<cards>;
  bv: number;
  totalPlayers: number;
  time: number;
  currentTurnUserId: string;
  currentTurnSeatIndex: number;
  DLR: number;
  playersDetail: Array<seatsInterface>;
  reconnect: boolean;
  trumpCard: Array<string>;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  finishDeck: Array<string>;
}


export interface tableQueue {
  tableId : Array<string>;
}
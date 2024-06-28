export interface walletDebitIf {
  tableId: string;
  tournamentId: string;
}

export interface multiPlayerDeductEntryFeeIf {
  tableId: string;
  tournamentId: string;
  userIds: Array<string>;
}


export interface multiPlayerDeductEntryFeeResponse {
  isMinPlayerEntryFeeDeducted : boolean;
  isInsufficiantBalance : boolean;
  insufficiantBalanceUserIds : Array<string>;
  deductedUserIds : Array<string>;
  notDeductedUserIds : Array<string>;
  deductedEntryFeesData : Array<any>;
  refundedUserIds : Array<string>;
}

export interface playersScoreIf {
  userId: string,
  score:string ,
  rank: string,
  wininigAmount:string ,
  winLossStatusstring:string
}

export interface multiPlayerWinnScoreIf {
  tableId: string;
  tournamentId: string;
  playersScore: playersScoreIf[]
}

export interface checkBalanceIf {
  tournamentId: string;
}

export interface getOneRobotRes {
  _id : string;
  bonus : number;
  role : string;
  isBlock : boolean;
  winCash : number;
  cash : number;
  profileImage : string;
  profileImageKey : string;
  fullName : string;
  isAvatarAsProfileImage : boolean;
  longitude : string;
  latitude : string;
  isBot : boolean;
  numericId: number;
  lastActivateAt: string;
  createdAt : string;
  updatedAt : string;
  token : string;
}

export interface rediusCheckDataRes {
  _id : string;
  gameId : string;
  isGameRadiusLocationOn : boolean;
  LocationRange : string;
  numericId: number;
  createdAt : string;
  updatedAt : string;
}


export interface markCompletedGameStatusIf {
  tableId: string;
  tournamentId: string;
  gameId: string;
}


export interface formatedwinnerScoreData {
  userId : string;
  score : string;
  winningAmount : string
  rank : string;
  winLossStatus :string;
}


export interface blockUserCheckI {
  tableId : string
  isNewTableCreated : boolean
}

export interface addGameRunningStatusIf{
  tableId: string;
  tournamentId: string;
  gameId: string;
}

export interface firstTimeIntrectionInput {
  gameId: string;
  gameModeId?: string;
}

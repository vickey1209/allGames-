

export interface SignupInput {
  accessToken: string;
  minPlayer: number;
  noOfPlayer: number;
  lobbyId: string;
  isUseBot: boolean;
  entryFee: string;
  moneyMode: string;
  totalRound: number;
  userName: string;
  userId: string;
  profilePic: string;
  gameId: string;
  rummyType: string;
  isFTUE: boolean;
  gameModeId : string;
  signUpType?: string;
  latitude : string;
  longitude : string;
}
export interface locationI {
  latitude: number;
  longitude: number;
}

export interface findUserI {
  socketId: string;
  userId: string;
  username: string;
  lobbyId: string;
  gameId: string;
  profilePic: string;
  entryFee: number;
  noOfPlayer: number;
  isUseBot: boolean;
  isFTUE: boolean;
  authToken: string;
  isAnyRunningGame: boolean;
  gameType : string;
  latitude : string;
  longitude : string;
}

export interface CreateTableI {
  socketId: string;
  userId: string;
  username: string;
  profilePic: string;
  entryFee: number;
  gameId: string;
  lobbyId: string;
  noOfPlayer: number;
  minPlayer: number;
  moneyMode : string;
  gameType : string;
  latitude : string;
  longitude : string;
  authToken : string;
  isUseBot: boolean;
}

export interface seatsInterface {
  userId: string;
  si: number;
  name: string;
  rejoin?: boolean;
  pp: string;
  userState: string;
}

export interface successRes {
  success: boolean;
  error: any;
  tableId?: string;
}

interface errorObj {
  errorCode: number;
  errorMessage: string;
}

export interface errorRes {
  success: boolean;
  error: errorObj | null;
}


export interface SignupResponse {
  _id: string;
  un: string;
  pp: string;
  // isRejoin: boolean;
  socketid: string;
  tableId: string;
  gameId: string;
  lobbyId: string;
  chips: string;
  isPlay?: boolean;
  isRobot: boolean;
  latitude : string;
  longitude : string;
  entryFee: string;
  maximumSeat: number;
  maxTableCreateLimit : number;
}

export interface nextTurnPlayerInterface {
  userId: string;
  seatIndex: number;
}

export interface empty { }
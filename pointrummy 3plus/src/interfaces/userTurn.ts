export interface StartUserTurnResponse {
  currentTurnUserId:string;
  currentTurnSI:number;
  turnTimer:number;
  // totalUserTurnTimer:number;
  isSeconderyTimer : boolean;
  isRemainSeconderyTurns : boolean;
  tableId : string;
}

export interface onTurnExpireCallInterface {
  tableId: string;
  userId: string;
}


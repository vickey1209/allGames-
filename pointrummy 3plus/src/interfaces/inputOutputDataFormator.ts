
/** save card in group Request & Response: start */
export interface saveCardsInSortsInput {
    userId : string;
    tableId : string;
    currentRound : number;
}

export interface CardSortsResponse {
    userId : string;
    tableId : string;
    cards : Array<cards>
    totalScorePoint : number;
}
/** save card in group Request & Response : End */


/** pickCardFormCloseDack Request & Response: start */
export interface pickCardFormCloseDackInput {
    userId : string;
    tableId : string;
    currentRound : number;
}

export interface cards {
    group : Array<string>;
    groupType : string;
    cardPoints : number
}

export interface pickCardFormCloseDackResponse {
    userId : string;
    si : number;
    tableId : string;
    cards : Array<cards>;
    totalScorePoint : number;
    msg : string;
    pickUpCard : string;
}
/** pickCardFormCloseDack Request & Response : End */


/** pickCardFormOpenDack Request & Response: start */
export interface pickCardFormOpenDackInput {
    userId : string;
    tableId : string;
    currentRound : number;
}

export interface pickCardFormOpenDackResponse {
    userId : string;
    si : number;  
    tableId : string;
    cards : Array<cards>;
    totalScorePoint : number;
    msg : string;
    pickUpCard : string;
}
/** pickCardFormOpenDack Request & Response : End */



/** discardCard Request & Response: start */
export interface discardCardInput {
    userId : string;
    tableId : string;
    currentRound : number;
    cards : Array<groupCards>;
}

export interface discardCardResponse {
    userId : string;
    si : number;
    tableId : string;
    cards : Array<cards>
    totalScorePoint : number;
    opendDeck : Array<string>;
}
/** discardCard Request & Response : End */

export interface groupCards {
    card : string;
    groupIndex : number;
}

/** groupCard in Request & Response: start */
export interface groupCardInput {
    userId : string;
    tableId : string;
    currentRound : number;
    cards : Array<groupCards>
}

export interface groupCardResponse {
    userId : string;
    tableId : string;
    cards : Array<cards>;
    totalScorePoint : number;
    msg: string;
}
/** groupCard Request & Response : End */


/** endDragCard in Request & Response: start */
export interface endDragCardInput {
    userId : string;
    tableId : string;
    currentRound : number;
    cards : Array<groupCards>;
    destinationGroupIndex : number;
    cardIndexInGroup: number;
}

export interface endDragCardResponse {
    userId : string;
    tableId : string;
    cards : Array<cards>,
    totalScorePoint : number;
}

/** endDragCard Request & Response : End */


/** openDeck Cards in Request & Response: start */
export interface openDeckCardsInput {
    userId : string;
    tableId : string;
    currentRound : number;
}

export interface openDeckCardsResponse {
    userId : string;
    tableId : string;
    currentRound : number;
    openDeckCards : Array<string>,
}
/** openDeck Cards Request & Response : End */


/** finish in Request & Response: start */
export interface finishInput {
    userId : string;
    tableId : string;
    currentRound : number;
    finishCard: Array<groupCards>
}
export interface finishResponse {
    currentTurnUserId : string;
    currentTurnSI : number;
    turnTimer : number,
    cards:Array<cards>;
    totalScorePoint :number;
    finishDeck : Array<string> 
    tableId : string;
}
/** finish Request & Response : End */


/** declare Data in Request & Response: start */
export interface declareDataInput {
    userId : string;
    tableId : string;
    currentRound : number;
}

export interface declareDataResponse {
    tableId : string;
    declareUserId : string;
    declareSI : number;
    declareTimer : number,
    siArrayOfdeclaringTimeStart : Array<number>;
    message : string;
    tableState : string;
}

/** declare Data Request & Response : End */


/** Drop Data in Request & Response: start */

export interface dropInput {
    userId : string;
    tableId : string;
    currentRound : number;
}

export interface dropResponse {
    userName : string;
    pp :string;
    userSI : number;
    userId : string;
    cards : cards[];
    tableId : string; 
    message : string;
}
/** Drop Data Request & Response : End */


/** leave Table Data in Request & Response: start */

export interface leaveTableInput {
    userId : string;
    tableId : string;
    currentRound : number;
    isLeaveFromScoreBoard : boolean;
}
export interface leaveTableResponse {
    userId : string;
    tableId : string; 
    currentRound : number;
    name : string;
    si : number;
    pp : string;
    message : string;
    updatedUserCount : number;
    tableState : string;
}

/** leave Table Data Request & Response : End */


/** game Table Info Data in Request & Response: start */
export interface gameTableInfoInput {
    userId : string;
    tableId : string;
    currentRound : number;
}
export interface gameTableInfoResponse {
    tableId : string; 
    gameType : string;
    variant : string;
    numberOfDeck : number;
    printedJoker : string;
    printedValue : number;
    drop : any
}

/** game Table Info Data Request & Response : End */

/** lastDeal Data in Request & Response: start */
export interface lastDealInput {
    userId : string;
    tableId : string;
    currentRound : number;
}
// export interface lastDealResponse {
//     lastDeal : scoreBoardResponse
// }

/** lastDeal Data Request & Response : End */


/** Resuffal Data Response  */
export interface ResuffalDataResponse {
    closedDeck : Array<string>;
    opendDeck : Array<string>; 
    tableId : string;
}


/* rejoinOrNewGame event Request*/
export interface rejoinOrNewGameInput {
    isRejoin : boolean;
    signUpData : string
}

/* switchTable event Request*/
export interface switchTableInput {
    userId : string;
    tableId : string;
    currentRound : number;
}

export interface helpMenuRulsInput {
    userId: string;
}
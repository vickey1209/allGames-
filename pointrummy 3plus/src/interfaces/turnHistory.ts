import { pairDataInterface } from "./playerGamePlay";

export interface gameDetailsInterface {
  roundNo: number;
  winnerId: number[];
  createdOn: string;
  modifiedOn: string;
  extra_info: string;
  userDetails: Array<userDetailInterface>
  turnsDetails: Array<turnDetailsInterface>;
}

export interface turnDetailsInterface {
  turnNo: number;
  userId: string;
  turnStatus: string;
  cardState: pairDataInterface;
  cardPoints : number;
  cardPicked: string;
  cardPickSource: string;
  cardDiscarded: string;
  createdOn: string;
}

export interface userDetailInterface {
  name : string;
  userId : string;
  seatIndex : number;
  pp : string;
}

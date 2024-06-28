import { scoreBoardResponse } from "./tableConfig";

export interface beforeScoreBoardTimerIf{
    timer:number;
    jobId:string;
    tableId:string;
    data:scoreBoardResponse
}

export interface scoreBoardTimerIf{
    timer:number;
    jobId:string;
    tableId:string;
}


export interface playerTurnTimerIf{
    timer:number;
    jobId:string;
    tableId:string;
    userId:string;
}
import { cards } from "./inputOutputDataFormator";
import { defaulPlayerGamePlayInterface } from "./playerGamePlay";

export interface manageAndUpdateDataInterface{
    cards : Array<cards>;
    totalScorePoint : number; 
    playerGamePlayUpdated : defaulPlayerGamePlayInterface;
}
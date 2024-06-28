import { EMPTY, NUMERICAL } from '../../constants';
import Logger from "../../logger"
import { defaultTableGamePlayInterface } from '../../interfaces/tableGamePlay';
import { defaulPlayerGamePlayInterface } from '../../interfaces/playerGamePlay';

async function selectCardToThrowOnTurnExpire(
  playerGamePlay: defaulPlayerGamePlayInterface,
  tableGamePlay: defaultTableGamePlayInterface
): Promise<string> {
  const userId = playerGamePlay.userId;
  try {
    let throwCard: string = EMPTY;
    playerGamePlay.currentCards.map((ele:any) => {
      ele.map((element :any, ind:any) =>{
        if(element == playerGamePlay.lastPickCard ){
          ele.splice(ind, NUMERICAL.ONE);
          throwCard = element;
        }
      })
    })


    Logger.info(userId,"playerGamePlay.currentCards : >>", playerGamePlay.currentCards, " throwCard : >>", throwCard);
    return throwCard;
  } catch (error) {
    Logger.error(userId,`Error in selectCardToThrowOnTurnExpire`, error);
    throw error;
  }
}

export = selectCardToThrowOnTurnExpire;

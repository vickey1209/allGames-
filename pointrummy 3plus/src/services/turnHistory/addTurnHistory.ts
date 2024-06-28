import Logger from "../../logger"
import { defaultTableGamePlayInterface } from '../../interfaces/tableGamePlay';
import { successRes } from '../../interfaces/signup';
import { defaulPlayerGamePlayInterface } from '../../interfaces/playerGamePlay';
import { turnHistoryCache } from '../../cache';
import {
  gameDetailsInterface,
  turnDetailsInterface,
  userDetailInterface
} from '../../interfaces/turnHistory';
import { EMPTY } from "../../constants";
import roundHistory from "./roundHistory";

async function addTurnHistory(
  tableId: string,
  currentRound: number,
  tableGamePlay: defaultTableGamePlayInterface,
  playerGamePlay: defaulPlayerGamePlayInterface
): Promise<successRes> {
  try {
    Logger.info(tableId,`Starting addTurnHistory for tableId : ${tableId} and round : ${currentRound}`);
    const currentTime = new Date();
    const turnHistoryData: Array<gameDetailsInterface> | null =
      await turnHistoryCache.getTurnHistory(tableId);

    let userDetailArr = <userDetailInterface[]>[];
    tableGamePlay.seats.map((ele) => {
      let userDetailObj = <userDetailInterface>{};
      userDetailObj.name = ele.name;
      userDetailObj.userId = ele.userId;
      userDetailObj.seatIndex = ele.si;
      userDetailObj.pp = ele.pp;
      userDetailArr.push(userDetailObj)
    })

    // turn history initialisation and modification
    let turnHistory: Array<gameDetailsInterface>;
    if (turnHistoryData) {
      turnHistory = turnHistoryData;
    } else {
      turnHistory = [
        {
          roundNo: currentRound,
          winnerId: [],
          createdOn: currentTime.toString(),
          modifiedOn: currentTime.toString(),
          extra_info: EMPTY,
          userDetails: userDetailArr,
          turnsDetails: []
        }
      ];
    }

    let currentRoundHistory: gameDetailsInterface | null =
      await roundHistory.getCurrentRoundHistory(turnHistory, currentRound);

    // Logger.info("<<========= currentRoundHistory =======>>", currentRoundHistory);
    
    if (!currentRoundHistory) {
      currentRoundHistory = {
        roundNo: currentRound,
        winnerId: [],
        createdOn: currentTime.toString(),
        modifiedOn: currentTime.toString(),
        extra_info: EMPTY,
        userDetails: userDetailArr,
        turnsDetails: []
      };
      turnHistory.push(currentRoundHistory);
    }

    const historyObj: turnDetailsInterface = {
      turnNo: tableGamePlay.turnCount,
      userId: playerGamePlay.userId,
      turnStatus: EMPTY,
      cardState: playerGamePlay.groupingCards,
      cardPoints : playerGamePlay.cardPoints,
      cardPicked: EMPTY,
      cardPickSource: EMPTY,
      cardDiscarded: EMPTY,
      createdOn: new Date().toString()
    };

    currentRoundHistory.turnsDetails.push(historyObj);
    turnHistory = await roundHistory.replaceRoundHistory(
      turnHistory,
      currentRound,
      currentRoundHistory
    );    
    await Promise.all([turnHistoryCache.setTurnHistory(tableId, turnHistory)]);
    Logger.info(tableId,`Ending addTurnHistory for tableId : ${tableId} and round : ${currentRound}` );

    return { success: true, error: null, tableId };
  } catch (error: any) {
    Logger.error(tableId,
      error,
      ` table ${tableId} and currentRound ${currentRound} function addTurnHistory`
    );
    throw new Error(error);
  }
}

export = addTurnHistory;

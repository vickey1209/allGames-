import Logger from "../../logger";
import { RoundStartInterface } from '../../interfaces/gameStart';
import tossCards from "../toss";
import countPlayingPlayers from "../../utils/countPlayingPlayers";
import { EVENTS, MESSAGES, NUMERICAL } from "../../constants";
import Errors from "../../errors";
import CommonEventEmitter from '../../commonEventEmitter';
import { getAllPlayingUser } from "../common/getAllPlayingUser";
import { tableConfigCache } from "../../cache";
import { tableGamePlayCache } from "../../cache";

import { tossCardStart } from "../../scheduler/queues/tossCard.queue";


async function tossCardTimer(
  gameData: RoundStartInterface
): Promise<boolean> {
  // let lock: any;
  const { tableId, currentRound } = gameData;
  try {
    Logger.info(tableId, `Starting tossCardTimertableId : ${tableId} and round : ${currentRound}` );
    // Logger.info(tableId, `Starting tossCardTimertableId tableGamePlay.currentPlayerInTable  :: `, tableGamePlay.currentPlayerInTable );

    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) { throw Error('Unable to get data tableConfig'); }

    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
    if (!tableGamePlay) { throw Error('Unable to get data tableGamePlay'); }

    const getAllPlayingPlayer = await getAllPlayingUser(tableGamePlay.seats);
    Logger.info(tableId, `tossCardTimertableId getAllPlayingPlayer  :: `, getAllPlayingPlayer ); 

    if(tableGamePlay.currentPlayerInTable < tableConfig.minPlayer || getAllPlayingPlayer.length < tableConfig.minPlayer){
      throw new Errors.InvalidInput("currentPlayerInTable is not more than two players")
    }

    await tossCards(tableId);
    const totalPlayingPlayerCount = await countPlayingPlayers(tableGamePlay,tableId);
    const tossTimer =  Number(totalPlayingPlayerCount * 1.4 * NUMERICAL.THOUSAND);
    Logger.info(tableId,"toss timer :: ", tossTimer);
    await tossCardStart({
      // timer: Number(TOSS_CARD_TIMER),
      timer: tossTimer,
      jobId: `${tableGamePlay.gameType}:tossCard:${tableId}`,
      tableId,
      currentRound,
      // tableGamePlay
    });

    Logger.info(tableId,`Ending tossCardTimer for tableId : ${tableId} and round : ${currentRound}`);
    return true;

  } catch (error: any) {
    Logger.error(tableId,
      error,
      ` table ${tableId} round ${currentRound} function tossCardTimer`
    );
    let msg = MESSAGES.ERROR.COMMON_ERROR;
    let nonProdMsg = "";
    let errorCode = 500;

    if (error instanceof Errors.InvalidInput) {
        nonProdMsg = "Invalid Input";
        CommonEventEmitter.emit(EVENTS.SHOW_POPUP_ROOM_SOCKET_EVENT, {
            tableId: tableId,
            data: {
                isPopup: true,
                popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                title: nonProdMsg,
                message: msg,
                tableId,
                buttonCounts: NUMERICAL.ONE,
                button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
            },
        });
    } 

    Logger.info(tableId,"ERROR ===>>", error);
    
    throw error;
  }
}

export = tossCardTimer;

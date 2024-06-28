import { EVENTS, TABLE_STATE } from "../../constants";
import commonEventEmitter from '../../commonEventEmitter';
import { getTableGamePlay, insertTableGamePlay } from "../../cache/tableGamePlay";
import { defaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";
import { beforeScoreBoardTimerIf } from "../../interfaces/SchedulerIf";
import { removeQueue } from "../common/queue";
import Logger from "../../logger";

async function expireScoreBoardShow(data: beforeScoreBoardTimerIf) {
    const tableId = data.tableId;
    try {
        Logger.info(tableId," expireScoreBoardShow --->>>", data)
        await removeQueue(data.tableId)
        const tableGamePlay = await getTableGamePlay(data.tableId) as defaultTableGamePlayInterface;
        tableGamePlay.tableState = TABLE_STATE.SCORE_BOARD;
        await insertTableGamePlay(tableGamePlay, data.tableId)

        commonEventEmitter.emit(EVENTS.SCORE_BOARD_SOCKET_EVENT, data);

        Logger.info(tableId," expireScoreBoardShow :: tableGamePlay :: ", tableGamePlay)

        // // scoreBoard timer
        // await scoreBoardTimer({
        //     timer: Number(NEW_GAME_START_TIMER + NUMERICAL.THOUSAND),
        //     jobId: `StartScoreBoardTimer:${data.tableId}`,
        //     tableId: data.tableId
        // })
    } catch (error) {
        Logger.error(tableId,"--- expireScoreBoardShow :: ERROR :: ", error)
    }
}

export = expireScoreBoardShow;
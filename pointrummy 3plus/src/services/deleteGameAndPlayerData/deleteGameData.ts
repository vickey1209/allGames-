import { tableConfigCache, userProfileCache } from "../../cache";
import { NUMERICAL } from "../../constants";
import { defaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";
import Logger from "../../logger";
import { tableQueue } from "../../interfaces/tableConfig";
import { cancelDeclarePlayerTurnTimer } from "../../scheduler/cancelJob/declarePlayerTurnTimer.cancel";
import { cancelPlayerTurnTimer } from "../../scheduler/cancelJob/playerTurnTimer.cancel";
import { cancelSeconderyTimer } from "../../scheduler/cancelJob/seconderyTimer.cancel";
import { cancelRejoinTimer } from "../../scheduler/cancelJob/rejoinTimer.cancel";



async function deleteGameData(
    tableGamePlay: defaultTableGamePlayInterface,
    tableId: string,
    userId?: string,
    newTableId?: string
) {

    try {
        Logger.info(tableId,'DELETE GAME DATA Call : tableGamePlay :>> ', tableGamePlay);
        for await (const seats of tableGamePlay.seats) {
            const player = seats;

            await cancelDeclarePlayerTurnTimer(`declare:${tableId}:${player.userId}:${NUMERICAL.ONE}`,tableId);
            await cancelPlayerTurnTimer(`${tableId}:${player.userId}:${NUMERICAL.ONE}`,tableId);
            await cancelSeconderyTimer(`${tableId}:${player.userId}:${NUMERICAL.ONE}`,tableId);
            await cancelRejoinTimer(`rejoinTimer:${tableId}:${player.userId}:${NUMERICAL.ONE}`,tableId);

            let userProfile = await userProfileCache.getUserProfile(player.userId);
            if (!userProfile) throw new Error('Unable to get user profile');

            Logger.info(tableId,"userProfile :;:>>", userProfile)
            userProfile.oldTableId = userProfile.oldTableId.filter(x => x !== tableId);
            Logger.info(tableId,'userProfile.oldTableId :>> ', userProfile.oldTableId);
            await userProfileCache.setUserProfile(player.userId, userProfile);

        }

        const tableConfig = await tableConfigCache.getTableConfig(tableId);
        if (!tableConfig) throw new Error('Unable to get table data');

        const key = `${tableConfig.lobbyId}`;
        let getTableQueueArr: tableQueue = await tableConfigCache.getTableFromQueue(key);
        if (getTableQueueArr) {
            Logger.info(tableId,'getTableQueueArr Before :>> ', getTableQueueArr);
            getTableQueueArr.tableId = getTableQueueArr.tableId.filter(x => x != tableId);
        }
        Logger.info(tableId,'getTableQueueArr After:>> ', getTableQueueArr);
        await tableConfigCache.setTableFromQueue(key, getTableQueueArr);
        // await tableConfigCache.popTableFromQueue(key);

    } catch (error) {
        Logger.error(tableId,`deleteGameData Error :: ${error}`)
        Logger.info(tableId,"<<======= deleteGameData() Error ======>>", error);
    }


}

export = deleteGameData;
import { tableConfigCache, tableGamePlayCache, userProfileCache } from "../../../cache";
import { PLAYER_STATE } from "../../../constants";
import { UserProfileOutput } from "../../../interfaces/userProfile";
import Logger from "../../../logger"
import { addGameRunningStatus } from "../../addGameRunningStatus";


async function addRunningStatus(tableId: string): Promise<boolean> {
    try {
        const [tableConfig, tableGamePlay] = await Promise.all([
            tableConfigCache.getTableConfig(tableId),
            tableGamePlayCache.getTableGamePlay(tableId)
        ]);
        if (!tableGamePlay || !tableConfig) { throw Error('Unable to get data'); }

        // user add Game Running Status 
        for await (const ele of tableGamePlay.seats) {

            let userProfile = await userProfileCache.getUserProfile(ele.userId) as UserProfileOutput;
            Logger.info(tableId, " roundStartTimer :: userProfile :: >> ", userProfile);
            if (ele.userState === PLAYER_STATE.PLAYING && tableId === userProfile.tableId) {
                const apiData = {
                    tableId,
                    tournamentId: userProfile.lobbyId,
                    gameId: userProfile.gameId
                }
                const addGameRunningDetail = await addGameRunningStatus(apiData, userProfile.authToken, userProfile.socketId, userProfile.userId);
            }
        }
        return true;

    } catch (error) {
        Logger.error(tableId, "CATCH_ERROR :addRunningStatus :: ", tableId, error);
        throw error;
    }
}

export = addRunningStatus
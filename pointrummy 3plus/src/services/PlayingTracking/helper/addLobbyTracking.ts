import Logger from '../../../logger';
import DB from '../../../mongoDB';
import { MONGO, NUMERICAL } from '../../../constants';
import { tableConfigCache, userProfileCache } from '../../../cache';
import lobbyValidator from '../../../validators/lobbyValidator';

async function addLobbyTracking(tableId: string): Promise<any> {
    try {

        const tableConfig =  await tableConfigCache.getTableConfig(tableId);
        if (!tableConfig) throw new Error(`User Or table data not found`);

        const findFlageQuery = {
            gameId: tableConfig.gameId,
        }
        const findFlage = await DB.mongoQuery.getOne(MONGO.FLAGE, findFlageQuery);
        Logger.info('addLobbyTracking :: findFlage :=>> ', findFlage);

        if (findFlage && findFlage.isPlayingTracking == true) {

            let createdAt = new Date()
            const resObj = {
                tableId: tableId,
                lobbyId: tableConfig.lobbyId,
                entryFee: String(tableConfig.entryFee * NUMERICAL.EIGHTY),
                // winningAmount: getUserDeatil.winningAmount,
                noOfPlayer: `${tableConfig.noOfPlayer}`,
                totalRound: Number(tableConfig.currentRound),
                createdAt: createdAt.toLocaleDateString("en-US")
            }
            const trackLobby = await lobbyValidator.lobbyEntryValidator(resObj);
            await DB.mongoQuery.add(MONGO.PLAYING_TRACKING_LOBBY, trackLobby)
            Logger.info("addLobbyTracking : trackLobby ::", trackLobby)
            
        } else {
            // data not track 
        }


    } catch (error) {
        Logger.error('CATCH_ERROR : getLobbyEntry :>> ', error);
    }
}

export = addLobbyTracking
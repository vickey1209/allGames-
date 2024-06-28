
import Logger from '../../../logger';
import DB from '../../../mongoDB';
import { MONGO } from '../../../constants';
import { tableConfigCache, tableGamePlayCache, userProfileCache } from '../../../cache';
import { userResDataInterface } from '../../../interfaces/tableConfig';

async function addCurrentRoundData(tableId: string, allUserPGP : Array<userResDataInterface>): Promise<any> {
    try {

        const userId = allUserPGP[0].userId;
        const [userDetail, tableConfig] = await Promise.all([
            userProfileCache.getUserProfile(userId),
            tableConfigCache.getTableConfig(tableId)
        ]);
        if(!userDetail || !tableConfig) throw new Error(`user or table data not found`);

        const findFlageQuery = { gameId: userDetail.gameId };
        const findFlage = await DB.mongoQuery.getOne(MONGO.FLAGE, findFlageQuery);
        Logger.info('addCurrentRoundData :: findFlage :=>> ', findFlage);

        if (findFlage && findFlage.isPlayingTracking == true) {
            let histroyArray: any[] = [];
            let createdAt = new Date();
            let histroyObj = {}
            allUserPGP.forEach(async (element : userResDataInterface) => {
                histroyObj = {
                    title: tableConfig.currentRound,
                    card: element.cards,
                    score: element.score,
                    status : element.result,
                    amount : element.amount
                }
                histroyArray.push(histroyObj)
            });

            const resObj = {
                tableId,
                histroy: histroyArray,
                createdAt: createdAt.toLocaleDateString("en-US"),
            }
            Logger.info("resObj  :: " + JSON.stringify(resObj));
            let query = { tableId: tableId }

            const getHistory = await DB.mongoQuery.getOne(MONGO.PLAYING_TRACKING_HISTORY, query)

            if (!getHistory) {
                let trackedHistory = await DB.mongoQuery.add(MONGO.PLAYING_TRACKING_HISTORY, resObj);
                Logger.info("addCurrentRoundData :: playingTrackingHistroy :: " , trackedHistory)
            }
        } else {
            // round data not tracked
        }

    } catch (error) {
        Logger.error('CATCH_ERROR : addCurrentRoundData :>> ', error, ' - ');
    }
}

export = addCurrentRoundData
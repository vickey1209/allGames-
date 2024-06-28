
import Logger from '../../../logger';
import DB from '../../../mongoDB';
import { MONGO, NUMERICAL } from '../../../constants';
import { getConfig } from "../../../config";
import playingTrackingValidator from '../../../validators/playingTrackingValidator';
const { GAME_ID } = getConfig();


async function cronJob(): Promise<any> {
    try {
        let date = new Date()

        const gameId = GAME_ID;
        Logger.info("gameId ::>>", gameId);
        const flage = await DB.mongoQuery.getOne(MONGO.FLAGE, { gameId : gameId });

        if (flage) {

            Logger.info("get flage ::==>>", flage);
            // date.setDate(date.getDate() - flage.noOfLastTrakingDays)
            // let trackedLobbyQuery = {
            //     createdAt: { $lte: date.toLocaleDateString("en-US") }// date.toLocaleDateString("en-US")
            // }

            // const promise_a = await DB.mongoQuery.removeAll(MONGO.PLAYING_TRACKING_LOBBY, trackedLobbyQuery)

            // const promise_b = await DB.mongoQuery.removeAll(MONGO.PLAYING_TRACKING_HISTORY, trackedLobbyQuery)

            // return Promise.all([promise_a, promise_b]);

        } else {
            let flageData = {
                gameId,
                isPlayingTracking: true,
                noOfLastTrakingDays: NUMERICAL.ZERO,
            }
            Logger.info("flageData ::==>>", flageData);
            
            flageData = await playingTrackingValidator.playingTrackingFlageValidator(flageData);
            await DB.mongoQuery.add(MONGO.FLAGE, flageData);
        }

    } catch (error) {
        Logger.error("CATCH_ERROR : cronJob ", error)
    }

}

export = cronJob
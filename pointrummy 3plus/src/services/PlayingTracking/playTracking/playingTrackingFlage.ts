import Logger from '../../../logger';
import DB from '../../../mongoDB';
import { MONGO } from '../../../constants';
import auth from '../auth';
import playingTrackingValidator from '../../../validators/playingTrackingValidator';


async function playingTrackingFlage(req: any, res: any) {
    try {

        const authKey = req.headers["authorization"];
        const gameId = req.body.gameId
        Logger.info("playingTrackingFlage :: req.body   =>>", req.body);
        // ----------------------- for JWT authrozation ----------------
        const key = await auth(authKey);
        Logger.info('playingTrackingFlage :: keyData ::=>> ', key);
        if (key.data == gameId) {
            const flage = await playingTrackingValidator.playingTrackingFlageValidator(req.body);

            const findFlageQuery = { gameId };
            const findFlage = await DB.mongoQuery.getOne(MONGO.FLAGE, findFlageQuery);
            Logger.info("playingTrackingFlage :: findFlage =>>", findFlage);

            if (findFlage) {
                let update = {
                    $set: {
                        isPlayingTracking: req.body.isPlayingTracking,
                        noOfLastTrakingDays: req.body.noOfLastTrakingDays
                    }
                };
                const updateFlage = await DB.mongoQuery.updateByCond(MONGO.FLAGE, { _id: DB.ObjectId(findFlage._id) }, update);
                const sendObj = {
                    status: 200,
                    success: true,
                    message: "flage update successfulley",
                    data: updateFlage
                }
                return res.send(sendObj)
            } else {
                const Addflage = await DB.mongoQuery.add(MONGO.FLAGE, flage);

                const sendObj = {
                    status: 200,
                    success: true,
                    message: "flage added successfulley",
                    data: Addflage
                }
                return res.send(sendObj)
            }
        } else {
            const sendObject = {
                status: 200,
                success: false,
                message: 'authorization fail',
                data: null,
            };
            return res.send(sendObject);
        }


        // ------------------------for normal authorization ------------------------
        // const seceretKey = "Artoon@123"

        // if (authKey!== seceretKey) {
        //     const sendObject = {
        //         status: 200,
        //         success: false,
        //         message: 'authorization fail',
        //         data: null,
        //     };
        //     res.send(sendObject);
        // }

        // const flage = await playingTrackingValidator.playingTrackingFlageValidator(req.body);

        // const findFlageQuery = {
        //     gameId : req.body.gameId ,
        // }
        // const findFlage = await DB.mongoQuery.getOne(MONGO.FLAGE, findFlageQuery);

        // if (findFlage) {
        //     let update = {
        //         $set: {
        //             isPlayingTracking : req.body.isPlayingTracking,
        //             noOfLastTrakingDays: req.body.noOfLastTrakingDays
        //         }
        //     }

        //     const updateFlage = await DB.mongoQuery.updateByCond(MONGO.FLAGE,{_id : DB.ObjectId(findFlage._id)}, update );

        //     const sendObj = {
        //         status: 200,
        //         success: true,
        //         message: "flage update successfulley",
        //         data: updateFlage
        //     }
        //     res.send(sendObj)

        // } else {
        //     const Addflage = await DB.mongoQuery.add(MONGO.FLAGE, flage);

        //     const sendObj = {
        //         status: 200,
        //         success: true,
        //         message: "flage added successfulley",
        //         data: Addflage
        //     }
        //     res.send(sendObj)
        // };

    } catch (error) {
        Logger.error('CATCH_ERROR : playingTrackingFlage ::', error)
    }
}

export = playingTrackingFlage
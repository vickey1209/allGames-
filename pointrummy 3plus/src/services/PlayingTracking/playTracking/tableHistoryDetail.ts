import Logger from '../../../logger';
import DB from '../../../mongoDB';
import { MONGO } from '../../../constants';
import auth from '../auth'

async function getTableHistoryDetail(req: any, res: any) {
    try {
        const { tableId, gameId } = req.body
        Logger.debug('getTableHistoryDetail :: req.body ::>>', req.body);
        const authKey = req.headers["authorization"];
        const seceretKey = "Artoon@123"
        // --------------for jwt auth with secretKey----------------------
        const key = await auth(authKey);
        Logger.info('getTableHistoryDetail :: keyData ::=>> ', key);
        if (key.data == gameId) {
            const query = {
                tableId
            }
            const getCurantRoundData = await DB.mongoQuery.getOne(MONGO.PLAYING_TRACKING_HISTORY, query);

            if (!getCurantRoundData) {
                const sendObject = {
                    status: 200,
                    success: false,
                    message: 'Table histroy not found!',
                    data: null,
                };
                return res.send(sendObject);
            } else {
                const sendObject = {
                    status: 200,
                    success: true,
                    message: 'histroy!',
                    data: getCurantRoundData,
                };
                return res.send(sendObject);
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

        // ------------------------ for normal auth --------------------------
        // if (authKey !== seceretKey) {
        //     const sendObject = {
        //         status: 200,
        //         success: false,
        //         message: 'authorization fail',
        //         data: null,
        //     };
        //     res.send(sendObject);
        // }

        // const query = {
        //     tableId
        // }
        // const getCurantRoundData = await DB.mongoQuery.getOne(MONGO.PLAYING_TRACKING_HISTORY, query);

        // if (!getCurantRoundData) {
        //     const sendObject = {
        //         status: 200,
        //         success: false,
        //         message: 'Table histroy not found!',
        //         data: null,
        //     };
        //     res.send(sendObject);
        // } else {
        //     const sendObject = {
        //         status: 200,
        //         success: true,
        //         message: 'histroy!',
        //         data: getCurantRoundData,
        //     };
        //     res.send(sendObject);
        // }

    } catch (error) {
        Logger.error('CATCH_ERROR : getTableHistoryDetail :>> ', error)
    }
}

export = getTableHistoryDetail;
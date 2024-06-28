
import Logger from '../../../logger';
import DB from '../../../mongoDB';
import { MONGO } from '../../../constants';
import auth from '../auth'

async function getTrackingLobby(req: any, res: any) {
    try {
        Logger.info("getTrackingLobby :: req.body ==>>", req.body)
        const skip = req.body.start;
        const limit = req.body.limit;
        const gameId = req.body.gameId
        const authKey = req.headers["authorization"];

        let query = {};
        const seceretKey = "Artoon@123"

        // ------------------ for jwt authorization ----------- 
        const key = await auth(authKey)
        Logger.info('getTrackingLobby :: keyData ::=>> ', key);
        if(key.data == gameId) {
            const trackedLobby = await paginetor({query, limit, skip})

            const sendObject = {
                status: 200,
                success: true,
                message: 'lobby!',
                data: trackedLobby,
            };
            return res.send(sendObject);

            async function paginetor({
                query,
                limit,
                skip,
              } : any) {

                const page = (skip/limit) + 1

                const [totalDoc, results] = await Promise.all([
                    DB.mongoQuery.countDocument(MONGO.PLAYING_TRACKING_LOBBY,query) ,

                    DB.mongoQuery.getTrackedlobby(MONGO.PLAYING_TRACKING_LOBBY, query, skip, limit),
                ]);

                const totalPages = Math.ceil(totalDoc / limit);
                const nextPage = totalPages > page ? page + 1 : null
                const hasNextPage = nextPage ? true : false;
                const prevPage = page == 1 ? null : page - 1 ;
                const hasPrevPage = prevPage ? true : false;
                const offset = skip;

                return { results,hasNextPage,hasPrevPage,limit,nextPage,offset ,page,prevPage,totalDoc,totalPages };
              };
        }else {
            const sendObject = {
                status: 200,
                success: false,
                message: 'authorization fail',
                data: null,
            };
           return res.send(sendObject);
        }

        // ------------------------------------for normal authorization ---------------------------------
        // if (authKey !== seceretKey) {
        //     const sendObject = {
        //         status: 200,
        //         success: false,
        //         message: 'authorization fail',
        //         data: null,
        //     };
        //     res.send(sendObject);
        // }

        // const trackedLobby = await paginetor({ query, limit, skip })

        // const sendObject = {
        //     status: 200,
        //     success: true,
        //     message: 'lobby!',
        //     data: trackedLobby,
        // };
        // res.send(sendObject);

        // async function paginetor({query,limit,skip}: any){

        //     const page = (skip / limit) + 1

        //     const [totalDoc, results] = await Promise.all([
        //         DB.mongoQuery.countDocument(MONGO.PLAYING_TRACKING_LOBBY, query),

        //         DB.mongoQuery.getTrackedlobby(MONGO.PLAYING_TRACKING_LOBBY, query, skip, limit),
        //     ]);

        //     const totalPages = Math.ceil(totalDoc / limit);
        //     const nextPage = totalPages > page ? page + 1 : null
        //     const hasNextPage = nextPage ? true : false;
        //     const prevPage = page == 1 ? null : page - 1;
        //     const hasPrevPage = prevPage ? true : false;
        //     const offset = skip;

        //     return { results, hasNextPage, hasPrevPage, limit, nextPage, offset, page, prevPage, totalDoc, totalPages };
        // };

    } catch (error) {
        Logger.error('CATCH_ERROR : getTrackingLobby  :>> ', error);
    }
}

export = getTrackingLobby;
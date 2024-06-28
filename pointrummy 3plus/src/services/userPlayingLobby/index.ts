
import logger from '../../logger';
import { userProfileCache } from '../../cache';
import { UserProfileOutput } from '../../interfaces/userProfile';

interface resDataI {
    lobbyId: string;
    gameId: string;
}

async function userPlayingLobby(req: any, res: any) {
    try {
        logger.info("req.body ", req.body);
        const { userId } = req.body;
        const userDetails = await userProfileCache.getUserProfile(userId);
        if(!userDetails) throw new Error(`get user profile failed`);
        logger.info("userDetails ", userDetails);

        let resData: resDataI = <resDataI>{};
        let isUserPlaying : boolean = false;
        if(userDetails && userDetails.lobbyId && userDetails.gameId) {
            isUserPlaying = true;
            resData.lobbyId = userDetails.lobbyId;
            resData.gameId = userDetails.gameId;
        }else{
            throw new Error("fetch User Playing Lobby Details failed");
        }
        logger.info("resData ", resData);

        const sendObject = {
            status: 200,
            success: true,
            message: "User Playing Lobby Details",
            data: {
                isUserPlaying,
                gameDetails : resData
            },
        }
        res.send(sendObject);

    } catch (error) {
        logger.error("CATCH_userPlayingLobby : ERROR ::", error);

        const sendObject = {
            status: 400,
            success: false,
            message: "fetch User Playing Lobby Details failed!",
            data: {
                isUserPlaying : false,
                gameDetails : null
            }
        }
        res.send(sendObject);
    }
}

export = userPlayingLobby;
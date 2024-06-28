
import { getOnliPlayerCountLobbyWise } from '../../cache/onlinePlayer';
import { NUMERICAL } from '../../constants';
import { ONLINE_PLAYER_LOBBY } from '../../constants/redis';
import Logger from "../../logger";

async function allLobbyWiseOnlinePlayer(req: any, res: any) {
    try {
        Logger.info('allLobbyWiseOnlinePlayer :: req.body  :::', req.body);
        let query = {
            lobbyIds: req.body.lobbyIds
        }
        
        const lobbyIds = query.lobbyIds;
        Logger.info('allLobbyWiseOnlinePlayer :: lobbyIds  :::', lobbyIds);

        if(!lobbyIds){
            const resObject = {
                status: 400,
                success: false,
                message: "oops! Something want wrong",
                data: null
            }
            return res.send(resObject)
        }
       
        let onlinePlayers: any[] = []

        for (let index = 0; index < lobbyIds.length; index++) {
            const element = lobbyIds[index];

            const getOnlinePlaer = await getOnliPlayerCountLobbyWise(ONLINE_PLAYER_LOBBY, element);
            Logger.info('allLobbyWiseOnlinePlayer :: getOnlinePlaer  :::', getOnlinePlaer);
            // const abc = NUMERICAL.TEN
            const data = {
                lobbyId: element,
                lobbyWiseOnlinePlayer: getOnlinePlaer == null ? NUMERICAL.ZERO : getOnlinePlaer
            }
            onlinePlayers.push(data)
        }

        Logger.info('allLobbyWiseOnlinePlayer :: onlinePlayers  :::', onlinePlayers);
        const resObject = {
            status: 200,
            success: true,
            message: "online players",
            data: onlinePlayers
        }
        return res.send(resObject)

    } catch (error) {
        Logger.error('allLobbyWiseOnlinePlayer :>> ', error);
        const resObject = {
            status: 400,
            success: false,
            message: "oops! Something want wrong",
            data: null
        }
        return res.send(resObject)
    }
}

export = allLobbyWiseOnlinePlayer
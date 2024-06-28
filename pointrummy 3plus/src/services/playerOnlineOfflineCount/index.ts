
import { getOnliPlayerCount } from '../../cache/onlinePlayer';
import { NUMERICAL, REDIS } from '../../constants/'
import  logger  from '../../logger';

async function getPlayerOnlineCount(req:any , res:any) {
    try {
        logger.info('getPlayerOnlineCount :: req.body :>> ', req.body);
        const onlinePlayerCount = await getOnliPlayerCount(REDIS.ONLINEPLAYER);
        logger.info("getPlayerOnlineCount : onlinePlayerCount :: ", onlinePlayerCount)

        if(!onlinePlayerCount){
            const sendObject = {
                status: 200,
                success: true,
                message: "Online Player",
                data: NUMERICAL.ZERO,  
            }
            return res.send(sendObject);
        }
    
        const sendObject = {
            status: 200,
            success: true,
            message: "Online Player",
            data: onlinePlayerCount, 
        }
        return res.send(sendObject);
    } catch (error) {
        logger.error("CATCH_GETONLINEPLAYERCOUNT ::" , error)
    } 
}

export = getPlayerOnlineCount;
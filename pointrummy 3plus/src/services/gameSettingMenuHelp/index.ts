import logger from "../../logger";
import { EVENTS } from "../../constants";
import CommonEventEmitter from '../../commonEventEmitter';
import { userProfileCache } from "../../cache";
import { gameSettinghelp } from "../../clientsideapi";
import Errors from "../../errors";
import { helpMenuRulsInput } from "../../interfaces/inputOutputDataFormator";


async function settingMenuHelp(data: helpMenuRulsInput, socket: any ) {    
    const  {userId}  = data;
    try {
        logger.debug(userId,"settingMenuHelp :: ", data)

        const {tableId} = socket.eventMetaData;
        const socketId = socket.id;
        
        const userProfile = await userProfileCache.getUserProfile(userId);
        if (!userProfile) throw new Errors.UnknownError('Unable to get player data');

        const gameId = userProfile.gameId
        const token = userProfile.authToken 

        const help = await gameSettinghelp(gameId, token, socketId, tableId)

        CommonEventEmitter.emit(EVENTS.GAME_SETTING_MENU_HELP_SOCKET_EVENT, {
            socket: socketId,
            tableId: tableId,
            data: help
        });


    } catch (error) {
        logger.error(userId,"CATCH_ERROR : settingMenuHelp :: ", data, " - ", error)
        throw error;
    }

}

export = settingMenuHelp;
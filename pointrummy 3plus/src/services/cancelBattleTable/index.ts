import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../../cache";
import Errors from "../../errors";
import { EMPTY, EVENTS, MESSAGES, NUMERICAL, REDIS } from "../../constants";
import { tableQueue } from "../../interfaces/tableConfig";
import Logger from "../../logger";
import CommonEventEmitter from "../../commonEventEmitter";
import { decrCounterLobbyWise } from "../../cache/onlinePlayer";
import { cancelAllScheduler } from "../../scheduler/cancelJob/allScheduler.cancel";


async function cancelBattleTable(tableId: string) {

    try {

        Logger.info("cancelBattleTable starting :: tableId  ::>> ", tableId);

        const [tableGamePlay, tableConfig] = await Promise.all([
            tableGamePlayCache.getTableGamePlay(tableId),
            tableConfigCache.getTableConfig(tableId)
        ])

        if (!tableGamePlay) throw new Errors.UnknownError('Unable to tableGamePlay data');
        if (!tableConfig) throw new Errors.UnknownError('Unable to tableConfig data');

        Logger.info("cancelBattleTable  :: tableGamePlay  ::>> ", tableGamePlay);
        Logger.info("cancelBattleTable  :: tableConfig ::>> ", tableConfig);

        let nonProdMsg = "cancel Battle";
        CommonEventEmitter.emit(EVENTS.SHOW_POPUP_ROOM_SOCKET_EVENT, {
            tableId,
            data: {
                isPopup: true,
                popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                title: nonProdMsg,
                message: MESSAGES.ERROR.ENTRY_FEE_DEDUCTED_MSG,
                buttonCounts: NUMERICAL.ONE,
                button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
            },
        });

        await cancelAllScheduler(tableId);

        for await (const player of tableGamePlay.seats) {

            const userProfile = await userProfileCache.getUserProfile(player.userId)
            if (!userProfile) throw new Errors.UnknownError('Unable to userProfile data');

            // lobby wise user decrement count
            Logger.info("leaveTable :: decrCounterLobbyWise :: Call");
            await decrCounterLobbyWise(REDIS.ONLINE_PLAYER_LOBBY, userProfile.lobbyId);
            
            // const lobbyWiseCounter = await getOnliPlayerCountLobbyWise(REDIS.ONLINE_PLAYER_LOBBY, userProfile.lobbyId)
            // if (lobbyWiseCounter == NUMERICAL.ZERO) { await removeOnliPlayerCountLobbyWise(REDIS.ONLINE_PLAYER_LOBBY, userProfile.lobbyId) };

            //user profile update
            userProfile.tableId = EMPTY;
            userProfile.tableIds = userProfile.tableIds.filter((ele) => ele != tableId);

            await Promise.all([
                playerGamePlayCache.deletePlayerGamePlay(player.userId, tableId),
                userProfileCache.setUserProfile(player.userId, userProfile)
            ])
        }

        //table queue delete
        let key = `${tableConfig.lobbyId}`;
        let getTableQueueArr: tableQueue = await tableConfigCache.getTableFromQueue(key);
        let arrayData = (getTableQueueArr && getTableQueueArr.tableId.length > NUMERICAL.ZERO) ? getTableQueueArr.tableId : [];
        arrayData = arrayData.filter((e) => e != tableId);
        Logger.info('arrayData :==>> ', arrayData);
        await tableConfigCache.setTableFromQueue(key, { tableId: arrayData });

        await Promise.all([
            tableConfigCache.deleteTableConfig(tableId),
            tableGamePlayCache.deleteTableGamePlay(tableId)
        ])

        Logger.info("cancelBattleTable ending :: tableId  ::>> ", tableId);

        return true;

    } catch (error) {
        Logger.error(tableId, `cancelBattleTable Error :: ${error}`);
        throw new Error(`cancelBattleTable Error`);
    }

}

export = cancelBattleTable;
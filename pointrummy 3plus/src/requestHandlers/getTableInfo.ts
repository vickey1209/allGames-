import Logger from "../logger";
import { gameTableInfoFormator } from "../InputDataFormator";
import { gameTableInfoInput } from "../interfaces/inputOutputDataFormator";
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache } from "../cache";
import { formatSettingMenuGameTableData } from "../formatResponseData";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes } from '../interfaces/signup';
import { EVENTS, MESSAGES, NUMERICAL } from "../constants";
import Errors from "../errors";
import Lock from '../lock';


async function gameTableInfoHandler(socket: any, gameTableInfoData: gameTableInfoInput): Promise<boolean | errorRes | undefined> {
    const socketId = socket.id;
    const userId = String(gameTableInfoData.userId) || socket.userId;
    const tableId = String(gameTableInfoData.tableId) || socket.tableId;
    // const lock = await Lock.getLock().acquire([`${userId}`], 2000);
    let lock:any = null;
    try {

        const formatedGameTableInfoData = await gameTableInfoFormator(gameTableInfoData);
        Logger.info(tableId," reqData : formatedGameTableInfoData ===>> ", formatedGameTableInfoData);

        await Lock.getLock().acquire([`${userId}`], 2000);

        const [playerGamePlay, tableGamePlay, tableConfig] = await Promise.all([
            playerGamePlayCache.getPlayerGamePlay(userId, tableId),
            tableGamePlayCache.getTableGamePlay(tableId),
            tableConfigCache.getTableConfig(tableId)
        ])

        if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');
        if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
        if (!tableConfig) throw new Errors.UnknownError('Unable to get table data');

        const formatedSettingGTIResponse = await formatSettingMenuGameTableData(
            tableId,
            tableConfig,
            tableGamePlay,
            playerGamePlay
        );

        CommonEventEmitter.emit(EVENTS.SETTING_MENU_GAME_TABLE_INFO_SOCKET_EVENT, {
            socket : socketId,
            tableId: tableId,
            data: formatedSettingGTIResponse
        });

        return true;
    }
    catch (error: any) {
        Logger.error(tableId,`openDeckCardsHandler Error :: ${error}`)

        let msg = MESSAGES.ERROR.COMMON_ERROR;
        let nonProdMsg = "";
        let errorCode = 500;


        if (error instanceof Errors.InvalidInput) {
            nonProdMsg = "Invalid Input";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: msg,
                    tableId,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        } else if (error instanceof Errors.UnknownError) {
            nonProdMsg = "FAILED";

            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: msg,
                    tableId,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        } else {
            CommonEventEmitter.emit(EVENTS.SETTING_MENU_GAME_TABLE_INFO_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    success: false,
                    error: {
                        errorCode,
                        errorMessage: error && error.message && typeof error.message === "string"
                            ? error.message
                            : nonProdMsg,
                    },
                }
            });
        }
    }
    finally {
        try {
            if (lock) await Lock.getLock().release(lock);
        } catch (error) {
            Logger.error(tableId,error, ' leaveTable ');
        }
    }
}

export = gameTableInfoHandler;



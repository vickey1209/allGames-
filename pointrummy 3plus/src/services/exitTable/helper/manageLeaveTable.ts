import { EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../../constants";
import { seatsInterface } from "../../../interfaces/signup";
import Logger from "../../../logger"
import CommonEventEmitter from '../../../commonEventEmitter';
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../../../cache";
import emitLeaveTableEvent from "./emitLeaveTableEvent";
import { removeQueue, setQueue } from "../../common/queue";
import { deletePlayerGamePlay } from "../../../cache/playerGamePlay";
import { cancelWaitingForPlayerTimer } from "../../../scheduler/cancelJob/waitingForPlayerTimer.cancel";
import { cancelRoundTimerStart } from "../../../scheduler/cancelJob/roundTimerStart.cancel";

async function manageLeaveTable(userId: string, tableId: string, socketId: string, isLeaveEventSend: boolean) {

    try {
        Logger.info(" manageLeaveTable :: Starting  :: userId  ::", userId, "tableId :: ", tableId, "socketId :: ", socketId, "isLeaveEventSend :: ", isLeaveEventSend);

        const tableConfig = await tableConfigCache.getTableConfig(tableId);
        if (!tableConfig) throw new Error('Unable to get table config');
        const [tableGamePlay, playerGamePlay, userProfile] = await Promise.all([
            tableGamePlayCache.getTableGamePlay(tableId),
            playerGamePlayCache.getPlayerGamePlay(userId, tableId),
            userProfileCache.getUserProfile(userId)
        ]);

        if (!tableGamePlay) throw new Error('Unable to get table game play');
        if (!playerGamePlay) throw new Error('Unable to get player game play');
        if (!userProfile) throw new Error('Unable to get user profile');

        Logger.info(tableId, " manageLeaveTable :: tableGamePlay ::", tableGamePlay);
        Logger.info(tableId, " manageLeaveTable :: playerGamePlay :: ", playerGamePlay);
        Logger.info(tableId, " manageLeaveTable :: userProfile :: ", userProfile);

        if (tableGamePlay.tableState === TABLE_STATE.WAITING_FOR_PLAYERS ||
            tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED ||
            tableGamePlay.tableState === TABLE_STATE.WAIT_FOR_OTHER_PLAYERS ||
            (tableGamePlay.tableState === TABLE_STATE.COLLECTING_BOOT_VALUE && playerGamePlay.userStatus !== PLAYER_STATE.WATCHING)
        ) {

            tableGamePlay.currentPlayerInTable -= NUMERICAL.ONE;

            Logger.info(tableId, " leaveTable ::> before ::> seats ::>", tableGamePlay.seats)
            const seats: seatsInterface[] = tableGamePlay.seats.filter(
                (seat: seatsInterface) => seat.userId !== playerGamePlay.userId
            );
            tableGamePlay.seats = seats;

            Logger.info(tableId, " leaveTable ::> after ::> seats ::>", tableGamePlay.seats)
            Logger.info(tableId, " tableGamePlay.currentPlayerInTable ==>", tableGamePlay.currentPlayerInTable);
            Logger.info(tableId, " tableGamePlay.tableState :: ", tableGamePlay.tableState);
            await emitLeaveTableEvent(tableId, playerGamePlay, userProfile, PLAYER_STATE.LEAVE, tableGamePlay.currentPlayerInTable, tableGamePlay.tableState, isLeaveEventSend, socketId);

            if (tableGamePlay.currentPlayerInTable === NUMERICAL.ZERO) {
                await removeQueue(tableId);
                await Promise.all([
                    await tableGamePlayCache.deleteTableGamePlay(tableId),
                    await tableConfigCache.deleteTableConfig(tableId),
                    await playerGamePlayCache.deletePlayerGamePlay(userId, tableId),
                ])
            }
            else { //more then two player

                Logger.info(" manageLeaveTable :: waiting :: tableGamePlay :: ", tableGamePlay);
                
                if (tableGamePlay.currentPlayerInTable < Number(tableConfig.minPlayer)) {

                    await cancelWaitingForPlayerTimer(`waitingForPlayerTimer:${tableId}`, tableId);
                    await cancelRoundTimerStart(`${tableConfig.gameType}:roundTimerStart:${tableId}`, tableId);

                    Logger.info(tableId, "-------------->> POPUP :: 2 <<---------------------")
                    tableGamePlay.tableState = TABLE_STATE.WAITING_FOR_PLAYERS;
                    tableGamePlay.isnextRound = false;
                    await setQueue(tableId)
                    let nonProdMsg = "Waiting for players";
                    CommonEventEmitter.emit(EVENTS.SHOW_POPUP_ROOM_SOCKET_EVENT, {
                        tableId,
                        data: {
                            isPopup: true,
                            popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
                            title: nonProdMsg,
                            message: MESSAGES.ERROR.WAITING_FOR_ANTHOR_PLAYERS,
                            showTimer: true,
                            tableId,
                        }
                    });
                }
                if (
                    (tableGamePlay.currentPlayerInTable === NUMERICAL.ONE && tableConfig.noOfPlayer === NUMERICAL.TWO) ||
                    (tableGamePlay.currentPlayerInTable === NUMERICAL.THREE && tableConfig.noOfPlayer === NUMERICAL.FOUR) ||
                    (tableGamePlay.currentPlayerInTable === NUMERICAL.FIVE && tableConfig.noOfPlayer === NUMERICAL.SIX)
                ) {
                    await setQueue(tableId)
                }

                await Promise.all([
                    await playerGamePlayCache.deletePlayerGamePlay(userId, tableId),
                    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
                ])

            }
        }
        else if (tableGamePlay.tableState === TABLE_STATE.LOCK_IN_PERIOD || tableGamePlay.tableState === TABLE_STATE.COLLECTING_BOOT_VALUE) {

            Logger.info("playerGamePlay.userStatus ::: >> ", playerGamePlay.userStatus);

            if (playerGamePlay.userStatus === PLAYER_STATE.WATCHING) {

                tableGamePlay.seats.filter((seat, index) => {
                    if (seat.userId === userId) {
                        tableGamePlay.seats.splice(index, NUMERICAL.ONE);
                    }
                });
                
                await setQueue(tableId);
                await emitLeaveTableEvent(
                    tableId,
                    playerGamePlay,
                    userProfile,
                    PLAYER_STATE.WATCHING_LEAVE,
                    tableGamePlay.currentPlayerInTable,
                    tableGamePlay.tableState,
                    isLeaveEventSend,
                    socketId
                );

                await Promise.all([
                    tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
                    playerGamePlayCache.deletePlayerGamePlay(userId, tableId)
                ]);

            } else {
                CommonEventEmitter.emit(EVENTS.LOCK_IN_PERIOD_SOCKET_EVENT, {
                    socket: socketId,
                    data: {
                        tableId,
                        currentRound: NUMERICAL.ONE,
                        msg: MESSAGES.ERROR.LOCK_IN_PEROID_MSG
                    }
                });
                Logger.info(tableId, " leaveTable :: LOCK_IN_PERIOD_SOCKET_EVENT ==>> LOCK_IN_TIMER : ");
                return false;
            }

        }

        Logger.info(" manageLeaveTable :: Ending  :: userId  ::", userId, "tableId :: ", tableId, "socketId :: ", socketId, "isLeaveEventSend :: ", isLeaveEventSend);
        return true;

    } catch (error) {

        Logger.error(tableId, `manageLeaveTable Error :: ${error}`)
        Logger.error(tableId, "<<======= manageLeaveTable() Error ======>>", error);
        throw new Error("manage Leave Table data error");
    }

}


export = manageLeaveTable;
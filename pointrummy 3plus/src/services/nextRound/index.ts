import { tableGamePlayCache } from "../../cache";
import { EVENTS, MESSAGES, NUMERICAL } from "../../constants";
import Logger from "../../logger";
import roundStartTimer from "../round/roundStartTimer";
import { checkBalanceBeforeNewRoundStart, reSetPlayerGamePlay, reSetTableConfig, reSetTableGameTable, sendJoinTableEvent, setDataInSocket } from "./helper";
import CommonEventEmitter from "../../commonEventEmitter"
import { deletePlayerGamePlay } from "../../cache/playerGamePlay";
import { removeQueue, setQueue } from "../common/queue";
import { defaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";
import { getConfig } from "../../config";
const { NEXT_GAME_START_TIMER } = getConfig();

async function nextRound(data: any) {
    const tableId = data.tableId;
    try {
        Logger.info("------------------------------------------------------------------------------------>>>>>>>>>>>>>  nextRound :: data :: >> ", data);

        //check Balance before new round starts
        const tableGamePlayData = await tableGamePlayCache.getTableGamePlay(data.tableId) as defaultTableGamePlayInterface;
        for await (const ele of tableGamePlayData.seats) {
            await checkBalanceBeforeNewRoundStart(ele.userId, data.tableId);
        }

        // remove queue &&  set tableConfig
        await removeQueue(data.tableId);
        const tableConfig = await reSetTableConfig(data.tableId);
        // set tableGamePlay
        const tableGamePlay = await reSetTableGameTable(data.tableId, tableConfig._id)

        Logger.info(tableId, "nextRound :: seat :: >> ", tableGamePlay.seats)
        // set PGP
        const userIDS: string[] = [];
        for await (const seat of tableGamePlay.seats) {
            // Logger.info("-------->> nextRound :: seat ::", seat)
            userIDS.push(seat.userId)
            await reSetPlayerGamePlay(
                seat.userId,
                tableConfig._id,
                seat.si,
                seat.name,
                seat.pp,
            )
            const deleteUser = await deletePlayerGamePlay(seat.userId, data.tableId);
        }

        Logger.info(tableId, " nextRound :: new table Id ::", tableConfig._id)
        Logger.info(tableId, " nextRound :: old table Id ::", data.tableId)

        const isSetSocketData = await setDataInSocket(
            data.tableId,
            tableConfig._id,
            userIDS
        )

        Logger.info(tableId, " nextRound :: isSetSocketData ::>>", isSetSocketData)
        // set JOIN TABLE EVENT

        if (isSetSocketData) {

            CommonEventEmitter.emit(EVENTS.NEW_GAME_START_SOCKET_EVENT, {
                tableId: tableConfig._id,
                data: {
                    oldTableId: data.tableId,
                    newTableId: tableConfig._id,
                    isNewGameStart: true,
                    tableId: data.tableId,
                    gameType: tableConfig.gameType
                }
            })

            // table player counts
            let totalPlayersCount: number = tableGamePlay.seats.length;
            Logger.info(tableId, " nextRound :: totalPlayersCount :: >>", totalPlayersCount)
            Logger.info(tableId, "nextRound :: tableConfig.maximumSeat :: >>", tableConfig.noOfPlayer)
            if (totalPlayersCount != NUMERICAL.ZERO) {

                // add queue
                if (totalPlayersCount < tableConfig.noOfPlayer) {
                    await setQueue(tableConfig._id);
                }

                // if players are one than one
                if (totalPlayersCount > NUMERICAL.ONE) {
                    await roundStartTimer(tableConfig._id, tableConfig.currentRound, Number(NEXT_GAME_START_TIMER));
                } else {
                    Logger.info(tableId, "Waiting for players  :: Pop-Up sending")

                    let nonProdMsg = "Waiting for players";
                    CommonEventEmitter.emit(EVENTS.SHOW_POPUP_ROOM_SOCKET_EVENT, {
                        tableId: tableConfig._id,
                        data: {
                            isPopup: true,
                            popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
                            title: nonProdMsg,
                            message: MESSAGES.ERROR.WAITING_FOR_ANTHOR_PLAYERS,
                            showTimer: true,
                            tableId: tableConfig._id
                        }
                    });
                }
            }

        }
    } catch (error) {
        Logger.error(tableId, "--- nextRound :: ERROR :: ", error)
    }
}

export = nextRound;
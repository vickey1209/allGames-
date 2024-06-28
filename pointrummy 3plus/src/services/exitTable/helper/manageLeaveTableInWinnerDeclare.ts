import Logger from "../../../logger"
import CommonEventEmitter from '../../../commonEventEmitter';
import { NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../../constants";
import { removeQueue } from "../../common/queue";
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../../../cache";
import { seatsInterface } from "../../../interfaces/signup";
import emitLeaveTableEvent from "./emitLeaveTableEvent";
import { cancelShowScoreBoardTimer } from "../../../scheduler/cancelJob/showScoreBoardTimer.cencal";
import { cancelScoreBoardTimer } from "../../../scheduler/cancelJob/scoreBoardTimer.cancel";
import { cancelSeconderyTimer } from "../../../scheduler/cancelJob/seconderyTimer.cancel";
import { cancelPlayerTurnTimer } from "../../../scheduler/cancelJob/playerTurnTimer.cancel";

async function manageLeaveTableInWinnerDeclare(userId: string, tableId: string, socketId: string, isLeaveEventSend: boolean) {

    try {
        Logger.info(" manageLeaveTableInWinnerDeclare :: Starting  :: userId  ::", userId, "tableId :: ", tableId, "socketId :: ", socketId, "isLeaveEventSend :: ", isLeaveEventSend);

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

        Logger.info(tableId, ` leaveTable :: tableState :: ${tableGamePlay.tableState}`)
        const key = `${userProfile.lobbyId}`;

        // seat user state change
        const updateSeats: seatsInterface[] = []
        let userCount = 0;
        tableGamePlay.seats.filter((seat) => {
            if (seat.userId === userId) {
                seat.userState = PLAYER_STATE.QUIT
                updateSeats.push(seat)
            } else {
                updateSeats.push(seat)
            }
        })
        Logger.info(tableId, "leaveTable :: updateSeats :: ", updateSeats)

        for await (const player of updateSeats) {
            if (player.userState !== PLAYER_STATE.QUIT && player.userState !== PLAYER_STATE.DISCONNECTED) {
                Logger.info(tableId,
                    `leaveTable :: currentPlayerInTable :: userID : ${player.userState} :: status ${player.userState}`
                )
                userCount += 1;
            }
        }

        for await (const player of tableGamePlay.seats) {
            await cancelPlayerTurnTimer(`${tableId}:${player.userId}:${tableConfig.currentRound}`, tableId);
            await cancelSeconderyTimer(`${tableId}:${player.userId}:${tableConfig.currentRound}`, tableId);
        }

        // playerGamePlay.userStatus = PLAYER_STATE.QUIT;
        tableGamePlay.currentPlayerInTable -= NUMERICAL.ONE;
        Logger.info(tableId, "- leaveTable :: userCount", userCount)
        Logger.info(tableId, "- leaveTable :: currentPlayerInTable", tableGamePlay.currentPlayerInTable)



        if (tableGamePlay.tableState === TABLE_STATE.WINNER_DECLARED) {

            if (userCount === NUMERICAL.ZERO) {
                Logger.info(tableId, ` leaveTable :: currentPlayerInTable :: ${tableGamePlay.currentPlayerInTable}`)
                await cancelShowScoreBoardTimer(`scoreBoard:${tableId}:${NUMERICAL.ONE}`, tableId);
                await cancelScoreBoardTimer(`StartScoreBoardTimer:${tableId}`, tableId);

                await removeQueue(tableId)
                for await (const player of updateSeats) {
                    await playerGamePlayCache.deletePlayerGamePlay(player.userId, tableId)
                }
                await tableGamePlayCache.deleteTableGamePlay(tableId);
                await tableConfigCache.deleteTableConfig(tableId);

            } else {

                tableGamePlay.seats = updateSeats;
                await Promise.all([
                    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
                    // await playerGamePlayCache.deletePlayerGamePlay(userId, tableId),
                ]);
            }

        } else if (tableGamePlay.tableState === TABLE_STATE.SCORE_BOARD) {

            if (userCount === NUMERICAL.ZERO) {
                Logger.info(tableId, `----->> leaveTable :: currentPlayerInTable :: ${tableGamePlay.currentPlayerInTable}`)
                await await cancelScoreBoardTimer(`StartScoreBoardTimer:${tableId}`, tableId);
                await await cancelShowScoreBoardTimer(`scoreBoard:${tableId}:${NUMERICAL.ONE}`, tableId);

                for await (const player of updateSeats) {
                    await playerGamePlayCache.deletePlayerGamePlay(player.userId, tableId)
                }
                await removeQueue(tableId);
                await tableGamePlayCache.deleteTableGamePlay(tableId);
                await tableConfigCache.deleteTableConfig(tableId);
            } else {
                tableGamePlay.seats = updateSeats;
                await Promise.all([
                    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
                    // await playerGamePlayCache.deletePlayerGamePlay(userId, tableId),
                ]);
            }

            await emitLeaveTableEvent(
                tableId,
                playerGamePlay,
                userProfile,
                PLAYER_STATE.LEAVE,
                tableGamePlay.currentPlayerInTable,
                tableGamePlay.tableState,
                isLeaveEventSend,
                socketId,
            );

        }

        Logger.info(" manageLeaveTableInWinnerDeclare :: Ending  :: userId  ::", userId, "tableId :: ", tableId, "socketId :: ", socketId, "isLeaveEventSend :: ", isLeaveEventSend);
        return true;

    } catch (error) {

        Logger.error(tableId, `manageLeaveTableInWinnerDeclare Error :: ${error}`)
        Logger.error(tableId, "<<======= manageLeaveTableInWinnerDeclare() Error ======>>", error);
        throw new Error("manage Leave Table In Winner Declare data error");
    }
}

export = manageLeaveTableInWinnerDeclare;
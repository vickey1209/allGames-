import { tableConfigCache, tableGamePlayCache} from "../../../cache";
import { deletePlayerGamePlay, getPlayerGamePlay } from "../../../cache/playerGamePlay";
import { deleteTableConfig } from "../../../cache/tableConfig";
import { getTableGamePlay, insertTableGamePlay, deleteTableGamePlay } from "../../../cache/tableGamePlay";
import { getUserProfile, setUserProfile } from "../../../cache/userProfile";
import { EMPTY, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../../constants";
import { defaulPlayerGamePlayInterface } from "../../../interfaces/playerGamePlay";
import { seatsInterface } from "../../../interfaces/signup";
import { defaultTableGamePlayInterface } from "../../../interfaces/tableGamePlay";
import { UserProfileOutput } from "../../../interfaces/userProfile";
import Logger from "../../../logger";
import { cancelRejoinTimer } from "../../../scheduler/cancelJob/rejoinTimer.cancel";
import deleteGameData = require("../../deleteGameAndPlayerData/deleteGameData");
import emitLeaveTableEvent = require("../../exitTable/helper/emitLeaveTableEvent");

function reSetTableGamePlayData(
    id: string,
    data: defaultTableGamePlayInterface,
    remainUsers: seatsInterface[]
): defaultTableGamePlayInterface {
    const currentTimestamp = new Date();
    const resObj = {
        _id: data._id,      /*String(GetRandomInt(1000000000, 9999999999)),*/
        trumpCard: [],
        closedDeck: [],
        opendDeck: [],
        finishDeck: [],
        turnCount: NUMERICAL.ZERO,
        tossWinPlayer: NUMERICAL.MINUS_ONE,
        dealerPlayer: NUMERICAL.MINUS_ONE,
        declareingPlayer: EMPTY,
        validDeclaredPlayer: EMPTY,
        validDeclaredPlayerSI: NUMERICAL.ZERO,
        finishCount: [],
        isTurn: false,
        isnextRound : (remainUsers.length > NUMERICAL.ONE) ? true : false,
        discardedCardsObj: [],
        potValue: NUMERICAL.ZERO,
        currentTurn: EMPTY,
        totalPickCount: NUMERICAL.ZERO,
        currentTurnSeatIndex: NUMERICAL.MINUS_ONE,
        currentPlayerInTable: remainUsers.length,
        tableState: (remainUsers.length > NUMERICAL.ONE) ? TABLE_STATE.ROUND_TIMER_STARTED : TABLE_STATE.WAITING_FOR_PLAYERS,
        seats: remainUsers,
        tableCurrentTimer: NUMERICAL.ZERO,
        gameType: data.gameType,
        isSeconderyTimer: false,
        createdAt: currentTimestamp.toString(),
        updatedAt: currentTimestamp.toString(),
    };
    return resObj
}


async function reSetTableGameTable(tableId: string, newTableId: string) {
    try {
        Logger.info(tableId, "reSetTableGameTable  :: tableId ::>", tableId, "newTableId ::>", newTableId);
        const tableGamePlay = await getTableGamePlay(tableId) as defaultTableGamePlayInterface;
        Logger.info(tableId, " reSetTableGameTable :: tableGamePlay ::>>", tableGamePlay);
        const seats = tableGamePlay.seats
        Logger.info(tableId, "reSetTableGameTable :: seats :: >>", seats);
        const remainUsers: seatsInterface[] = [];

        for await (const seat of seats) {
            // const userProfile = await getUserProfile(seat.userId) as UserProfileOutput;
            const playerGamePlay = await getPlayerGamePlay(seat.userId, tableId) as defaulPlayerGamePlayInterface;
            const userProfile = await getUserProfile(seat.userId) as UserProfileOutput;
            Logger.info(tableId, "reSetTableGameTable :: playerGamePlay :: >>", playerGamePlay);
            Logger.info(tableId, "reSetTableGameTable :: userProfile :: >> ", userProfile);
            if ((playerGamePlay && playerGamePlay.playingStatus === PLAYER_STATE.DISCONNECTED) ||
                seat.userState === PLAYER_STATE.DISCONNECTED ||
                seat.userState === PLAYER_STATE.QUIT ||
                (userProfile.tableId !== EMPTY && userProfile.tableId !== tableId)
            ) {
                await cancelRejoinTimer(`rejoinTimer:${tableId}:${seat.userId}:${NUMERICAL.ONE}`, tableId);
                if(seat.userState === PLAYER_STATE.DISCONNECTED){
                    await emitLeaveTableEvent(tableId, playerGamePlay, userProfile, PLAYER_STATE.LEAVE, tableGamePlay.currentPlayerInTable, tableGamePlay.tableState, false, userProfile.socketId);  
                }
                await deletePlayerGamePlay(seat.userId, tableId);

            } else if (
                seat.userState !== PLAYER_STATE.DISCONNECTED &&
                seat.userState !== PLAYER_STATE.QUIT
            ) {

                const obj = {
                    userId: seat.userId,
                    si: seat.si,
                    name: seat.name,
                    pp: seat.pp,
                    userState: PLAYER_STATE.PLAYING,
                }
                remainUsers.push(obj);

                userProfile.tableId = newTableId;
                userProfile.tableIds.push(newTableId);
            }
            userProfile.tableIds = userProfile.tableIds.filter((el) => tableId != el);
            Logger.info(tableId, "reSetTableGameTable :: >> userProfile.tableId", userProfile.tableId, "userProfile.tableIds :: >> ", userProfile.tableIds);
            await setUserProfile(seat.userId, userProfile);
        }
        Logger.info(tableId, " reSetTableGameTable :: remainUsers ::>>", remainUsers)

        const setTableGamePlayData = await reSetTableGamePlayData(newTableId, tableGamePlay, remainUsers);
        Logger.info(tableId, " reSetTableGameTable :: setTableGamePlayData ::>>", setTableGamePlayData);

        if (setTableGamePlayData.seats.length === NUMERICAL.ZERO) {
            await Promise.all([
                deleteTableConfig(newTableId),
                deleteTableGamePlay(newTableId),
            ])
        }
        else {
            await insertTableGamePlay(setTableGamePlayData, newTableId);
        }

        await deleteGameData(tableGamePlay, tableId);
        await Promise.all([
            tableConfigCache.deleteTableConfig(tableId),
            tableGamePlayCache.deleteTableGamePlay(tableId)
        ])

        return setTableGamePlayData;

    } catch (error) {
        Logger.error(tableId, "--- reSetTableGameTable :: ERROR ::", error);
        throw error;
    }
}

export = reSetTableGameTable;
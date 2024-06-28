import Logger from "../logger";
import {
  tableConfigCache,
  playerGamePlayCache,
  tableGamePlayCache,
  userProfileCache
} from '../cache';
import {
  TABLE_STATE,
  NUMERICAL,
  PLAYER_STATE,
  EMPTY,
  REDIS
} from '../constants';
import { successRes, empty, seatsInterface } from '../interfaces/signup';
import leaveTableHandler from "./leaveTableHandler";
import { getConfig } from "../config";
const { REJOIN_TIMER } = getConfig();
import { defaulPlayerGamePlayInterface } from "../interfaces/playerGamePlay";
import { rejoinTimerStart } from "../scheduler/queues/rejoinTimer.queue";


async function disconnectHandler(
  data: empty,
  socket: any
): Promise<successRes> {
  const userData = socket.eventData;
  let lock: any;
  const tableId = socket.tableId;
  Logger.info(tableId, '<<== starting disconnectHandler ==>>');
  try {
    Logger.info(tableId, ' starting disconnectHandler userData :: >> ', userData);
    if (userData && ['tableId'].every((key) => Object.keys(userData).includes(key))) {
      const userId = socket.userId;

      const [tableGamePlay, playerGamePlay, userProfile, tableConfig] = await Promise.all([
        tableGamePlayCache.getTableGamePlay(tableId),
        playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId),
        userProfileCache.getUserProfile(userId),
        tableConfigCache.getTableConfig(tableId)
      ]);

      if (!tableGamePlay) throw Error('tableGamePlay not found !');
      if (!userProfile) throw Error('userProfile not found !');
      if (!playerGamePlay) throw Error('playerGamePlay not found !');
      if (!tableConfig) throw Error('tableConfig not found !');

      Logger.info(" DisconnectHandler :: playerGamePlay.userStatus Before ====>>", playerGamePlay.userStatus);

      if (playerGamePlay.userStatus !== PLAYER_STATE.QUIT) {

        if (userProfile.socketId !== socket.id)
          return { success: true, error: null };

        const { currentRound } = tableConfig;
        const { tableState, seats } = tableGamePlay;
        Logger.info(" DisconnectHandler :: tableState ==>>", tableState, "tableId : =>", tableId);
        Logger.info(" DisconnectHandler :: userStatus ==>>", playerGamePlay.userStatus);
        Logger.info(" DisconnectHandler :: tableGamePlay ==>>", tableGamePlay);

        const userInfo = seats.find((seat) => {
          return seat.userId === userId
        })

        if (
          tableState === TABLE_STATE.WINNER_DECLARED ||
          tableState === TABLE_STATE.SCORE_BOARD
        ) {
          Logger.info('DisconnectHandler :: tableState ==>> :>> ', tableState);
          const updateSeats: seatsInterface[] = []
          let alreadyLeave: boolean = false;

          for await (const seat of tableGamePlay.seats) {
            if (seat.userId === userId) {
              if (
                seat.userState === PLAYER_STATE.DISCONNECTED ||
                seat.userState === PLAYER_STATE.QUIT
              ) {
                alreadyLeave = true;
                seat.userState = PLAYER_STATE.DISCONNECTED
              } else {
                seat.userState = PLAYER_STATE.DISCONNECTED
                alreadyLeave = false;
              }
            }
            updateSeats.push(seat)
          }

          Logger.info('DisconnectHandler :: alreadyLeave ==>> :>> ', alreadyLeave);
          if (!alreadyLeave) {
            playerGamePlay.userStatus = PLAYER_STATE.DISCONNECTED;
            playerGamePlay.playingStatus = PLAYER_STATE.DISCONNECTED;
            // await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
            tableGamePlay.seats = updateSeats;

            await Promise.all([
              tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
              playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId)
            ]);

            Logger.info('call leave table');
            leaveTableHandler(socket, { userId, tableId, currentRound, isLeaveFromScoreBoard : true });
            return { success: true, error: null, tableId };
          }
        }
        else if (tableGamePlay.tableState === TABLE_STATE.WAITING_FOR_PLAYERS ) {

          for await (const seat of tableGamePlay.seats) {
            if (seat.userId === userId) {
              Logger.info("DisconnectHandler :: leaveTableHandler:: seat ::>>", seat);
              leaveTableHandler(socket, { userId, tableId, currentRound, isLeaveFromScoreBoard : false });
            }
          }
        }
        else if (
          userInfo?.userState !== PLAYER_STATE.QUIT &&
          userInfo?.userState !== PLAYER_STATE.WATCHING_LEAVE &&
          userInfo?.userState !== PLAYER_STATE.DISCONNECTED &&
          playerGamePlay.userStatus != PLAYER_STATE.QUIT &&
          playerGamePlay.userStatus != PLAYER_STATE.WATCHING_LEAVE &&
          tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED &&
          tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD &&
          tableGamePlay.tableState !== TABLE_STATE.WAITING_FOR_PLAYERS &&
          tableGamePlay.tableState !== TABLE_STATE.WAIT_FOR_OTHER_PLAYERS &&
          tableGamePlay.tableState !== TABLE_STATE.ROUND_TIMER_STARTED 
          // tableGamePlay.tableState !== TABLE_STATE.LOCK_IN_PERIOD &&
          // tableGamePlay.tableState !== TABLE_STATE.COLLECTING_BOOT_VALUE &&
          // tableGamePlay.tableState !== TABLE_STATE.START_DEALING_CARD
        ) {
          Logger.info(" DISCONNECTRD TIMER STARTED ===== rejoinTimer >>>", Number(REJOIN_TIMER));
          Logger.info(`user ${userId} disconnected from table ${tableId} in round ${currentRound} from lobbyId ${tableConfig.lobbyId}`);
          let playerGamePlayData = await playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId) as defaulPlayerGamePlayInterface;

          playerGamePlayData.playingStatus = PLAYER_STATE.DISCONNECTED;
          userProfile.tableId = tableId;
          await Promise.all([
            playerGamePlayCache.insertPlayerGamePlay(playerGamePlayData, tableId),
            userProfileCache.setUserProfile(userId, userProfile)
          ])

          let userdata = { userId, tableId, socket: socket.id };
          let rejoinTimer = Number(REJOIN_TIMER);

          await rejoinTimerStart({
            timer: rejoinTimer,
            jobId: `rejoinTimer:${tableId}:${userId}:${NUMERICAL.ONE}`,
            data: userdata,
            socket: socket.id
          })

        }
      }

    }
    return { success: true, error: null };
  } catch (error: any) {
    // ignoring redis call catch error for now
    Logger.error(tableId, ` user ${socket && socket.userId} function disconnectHandler :: ignoring redis call catch error`);
    throw error;
  }
  // finally{
  //   try {
  //     if (lock) await Lock.getLock().release(lock);
  //   } catch (error) {
  //     Logger.error(error, '---disconnectHandler ');
  //   }
  // }
}

export = disconnectHandler;

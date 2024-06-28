import Logger from "../../logger"
import { UserProfileDataInput, UserProfileOutput } from "../../interfaces/userProfile";
import { ackEvent, userProfile } from "../../utils";
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from '../../cache';
import { defaultUserProfile } from "../../defaultGenerator";
import { EVENTS, MESSAGES, NUMERICAL } from "../../constants";
import { NewGTIResponse } from "../../interfaces/tableConfig";
import {formatSignUpData } from "../../formatResponseData";
import Errors from "../../errors";;
import CommonEventEmitter from '../../commonEventEmitter';
import iamBackHandler from "../../requestHandlers/iamBackHandler";
import { diffSeconds } from "../../common";
import formatingSignUpResData from "./helper/formatingSignUpResData";



async function findOrCreateUser(
  userData: UserProfileDataInput
): Promise<UserProfileOutput> {
  const { userId } = userData;
  try {
    Logger.info(userId,`Starting findOrCreateUser for userId : ${userId}`);
    let userProfileData = await userProfile.getUser({ _id: userId });
    Logger.info(userId," get-userProfileData :: ", userProfileData);

    if (userProfileData) {
      // update data
      userProfileData.socketId = userData.socketId;
      userProfileData.username = userData.username;
      userProfileData.lobbyId = userData.lobbyId;
      userProfileData.gameId = userData.gameId;
      userProfileData.profilePic = userData.profilePic;
      userProfileData.entryFee = userData.entryFee;
      userProfileData.noOfPlayer = userData.noOfPlayer;
      userProfileData.authToken = userData.authToken;
      userProfileData.isAnyRunningGame = userData.isAnyRunningGame; 
      userProfileData.isUseBot = userData.isUseBot;
      userProfileData.isFTUE = userData.isFTUE;
      userProfileData.longitude = userData.longitude || "0";
      userProfileData.latitude = userData.latitude || "0";
      userProfileData.balance = userData.balance;
      userProfileData.gameType = userData.gameType;

      const userLastUpdatedtimer = diffSeconds(new Date(), new Date(userProfileData.updatedAt));  // seconds
      const userLastUpdatedtimerInHours = Math.floor(userLastUpdatedtimer / (60 * 60));
      Logger.info(userId,'userLastUpdatedtimer ::==>> ', userLastUpdatedtimer, "==>>", userLastUpdatedtimerInHours);
      Logger.info(userId,'Before userProfileData.oldTableId ::==>> ', userProfileData.oldTableId);

      if (userLastUpdatedtimerInHours > 1) {
        if (userProfileData.oldTableId.length > NUMERICAL.TEN) {
          userProfileData.oldTableId.splice(NUMERICAL.ZERO, userProfileData.oldTableId.length - NUMERICAL.TEN);
        }
      }
      userProfileData.updatedAt = (userLastUpdatedtimerInHours > NUMERICAL.ONE) ? new Date().toString() : userProfileData.updatedAt;
      Logger.info(userId,'After userProfileData.oldTableId ::==>> ', userProfileData.oldTableId);

    } else {
      const userProfileDefault = await defaultUserProfile(userData);
      userProfileData = userProfileDefault;
    }
    
    await userProfileCache.setUserProfile(userProfileData.id, userProfileData);
    Logger.info(userId,`Ending findOrCreateUser for userId : ${userId}`, JSON.stringify(userProfileData));
    
    return userProfileData;

  } catch (error: any) {
    Logger.error(userId,error, ` user ${userId} function findOrCreateUser`);
    throw error;
  }
}

async function reconnection(
  tableId: string,
  userId: string,
  userProfileData: UserProfileOutput,
  socket: any,
  ack?: any,
): Promise<NewGTIResponse | boolean | undefined> {
  const socketId = socket.id;
  try {
    Logger.info(userId,`Starting reconnection for tableId : ${tableId} and userId : ${userId}`);

    const userProfile = await userProfileCache.getUserProfile(userId);
    if (!userProfile) throw new Errors.UnknownError('userProfile not found !');
    userProfile.socketId = socketId;
    await userProfileCache.setUserProfile(userId, userProfile);

    const [tableConfig, playerGamePlay, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId),
      tableGamePlayCache.getTableGamePlay(tableId)
    ]);

    Logger.info(userId," reconnection :::  tableConfig :: ", tableConfig);
    Logger.info(userId," reconnection :::  tableGamePlay :: ", tableGamePlay);
    Logger.info(userId," reconnection :::  playerGamePlay :: ", playerGamePlay);
    Logger.info(userId," reconnection :: userProfile: " + JSON.stringify(userProfile))

    if (!tableConfig || !tableGamePlay || !playerGamePlay) {
      await userProfileCache.deleteUserProfile(userId);
      throw new Errors.UnknownError('table config || tableGamePlay || playerGamePlay not found !');
    }

    // if player already exited from table
    if (tableGamePlay && tableGamePlay.seats && tableGamePlay.seats.length) {
      let existedInTable = true;
      for (let i = 0; i < tableGamePlay.seats.length; i++) {
        const element = tableGamePlay.seats[i];
        if (element.userId === userId) {
          existedInTable = false;
          break;
        }
      }

      if (existedInTable)
        throw new Errors.UnknownError('player already exited');
    }


    const { gameTableInfoData, currentGameTableInfoData } = await formatingSignUpResData(userId, true);
    const formatedSignupResponse = await formatSignUpData(userProfileData);
   
    ackEvent.ackMid(
      EVENTS.SIGN_UP_SOCKET_EVENT,
      {
        signupResponse: formatedSignupResponse,
        gameTableInfoData: gameTableInfoData,
        reconnect: true
      },
      socket.userId,
      tableId,
      ack
    );
    Logger.info("userProfile.tableIds ::==>>", userProfile.tableIds);
    

    await iamBackHandler(socket, { userId, tableId : tableId});

    // for (let index = 0; index < userProfile.tableIds.length; index++) {
    //   //i am back handler 
    //   await iamBackHandler(socket, { userId, tableId:userProfile.tableIds[index] });
    // }
    

    return currentGameTableInfoData[NUMERICAL.ZERO];

  } catch (error: any) {
    Logger.error(userId,error, ` table ${tableId} user ${userId} function rejoinHandler`, error);

    let msg = MESSAGES.ERROR.COMMON_ERROR;
    let nonProdMsg = "";

    if (error instanceof Errors.InvalidInput) {
      return false;
    }
    else if (error instanceof Errors.UnknownError) {
      nonProdMsg = "FAILED";
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: msg,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    }
    throw error;
  }
}

const exportedObject = { findOrCreateUser, reconnection };
export = exportedObject;


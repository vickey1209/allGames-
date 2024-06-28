import Logger from "../logger";
import {rejoinOrNewGameInput } from "../interfaces/inputOutputDataFormator";
import {tableGamePlayCache, userProfileCache } from "../cache";
import CommonEventEmitter from '../commonEventEmitter';
import { errorRes, SignupInput } from '../interfaces/signup';
import { EMPTY, EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../constants";
import Errors from "../errors";
import signUpHandler from "./signupHandler";
import leaveTableHandler from "./leaveTableHandler";
import { createOrFindUser } from "../services/userPlayTable";
import { reconnection } from "../services/signUp";
import { verifyUserProfile } from "../clientsideapi";
import { joinTable } from "../services/playTable/joinTable";


async function rejoinOrNewGameHandler(socket: any, rejoinOrNewGameData: rejoinOrNewGameInput, ack?: any): Promise<boolean | errorRes | undefined> {
    const socketId = socket.id;
    //   const lock = await Lock.getLock().acquire([`${tableId}`], 2000);
    let tempSignUpData = JSON.parse(rejoinOrNewGameData.signUpData);
    const signUpDetails: SignupInput = tempSignUpData.data;
    const userId = signUpDetails.userId;
    Logger.info(userId,'signUpData :===>>>> ', signUpDetails);

    let isValidUserData = await verifyUserProfile(socket.authToken, signUpDetails.gameId, socketId, userId);
    Logger.info(userId,"isValidUserData :: >> ", isValidUserData);

    try {
        Logger.info(userId,`Starting rejoinOrNewGameHandler :>> `);
        Logger.info(userId,`rejoinOrNewGameData ::> ${JSON.stringify(rejoinOrNewGameData)}`);

        let userProfileData = await userProfileCache.getUserProfile(userId);
        if (!userProfileData) throw new Errors.UnknownError('get user details');
        Logger.info(userId,"userProfileData ===>>", userProfileData)

        if (rejoinOrNewGameData.isRejoin) {

            if (userProfileData && userProfileData.tableId) {

                const userSignUp = await createOrFindUser({
                    socketId: socketId.toString(),
                    userId: userProfileData?.userId,
                    lobbyId: userProfileData.lobbyId,
                    gameId: userProfileData.gameId,
                    username: userProfileData.username,
                    profilePic: userProfileData.profilePic,
                    entryFee: Number(Number(userProfileData.entryFee) / NUMERICAL.EIGHTY),
                    noOfPlayer: userProfileData.noOfPlayer,
                    gameType: userProfileData.gameType,
                    isUseBot: userProfileData.isUseBot,
                    isFTUE: userProfileData.isFTUE,
                    authToken: socket.authToken || userProfileData.authToken,
                    isAnyRunningGame: (isValidUserData && isValidUserData.isValidUser) ? isValidUserData.isAnyRunningGame : false,
                    latitude : userProfileData.latitude,
                    longitude : userProfileData.longitude
                });
                if (!userSignUp) throw new Errors.UnknownError('USER_SIGNUP_FAILED');

                let userProfile = userSignUp.userProfile;
                Logger.info(userId,"userProfile :::>>", userProfile);

                const reconnectResponse = await reconnection(userProfileData.tableId, userProfileData.userId, userProfile, socket, ack);

                // await emitSignUpEvent(userProfile, socketId);

                // await iamBackHandler(socket, {
                //     userId: userProfileData.userId,
                //     tableId: userProfileData.tableId
                // })
            }
            else {
                Logger.info(userId,'rejoinOrNewGameHandler  userProfileData.tableId :: =>>', userProfileData.tableId);

                let isRejoinOrNewGame = false;
                let response: any = await signUpHandler(socket, signUpDetails, isRejoinOrNewGame, ack);
                Logger.info(userId,"Before Join Table ::: response :: ====>>", response);
                if (response && 'tableId' in response && !response['reconnect'])
                    await joinTable(response, socket, false);
                if (response && response['reconnect']) await joinTable(response, socket, true);

                // throw new Errors.UnknownError('rejoinOrNewGameHandler  not working');
            }

        } else {
            let isRejoinOrNewGame = false;
            if (userProfileData && userProfileData.tableId) {

                const tableGamePlay = await tableGamePlayCache.getTableGamePlay(userProfileData.tableId);
                if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');

                if (
                    tableGamePlay.tableState === TABLE_STATE.WAIT_FOR_OTHER_PLAYERS ||
                    tableGamePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED ||
                    tableGamePlay.tableState === TABLE_STATE.ROUND_STARTED
                ) {
                    await leaveTableHandler(socket, {
                        userId: userProfileData.userId,
                        tableId: userProfileData.tableId,
                        currentRound: NUMERICAL.ONE,
                        isLeaveFromScoreBoard : false
                    })

                    let response: any = await signUpHandler(socket, signUpDetails, isRejoinOrNewGame, ack);
                    Logger.info(userId,"Before Join Table ::: response :: ====>>", response);
                    if (response && 'tableId' in response && !response['reconnect'])
                        await joinTable(response, socket, false);
                    if (response && response['reconnect']) await joinTable(response, socket, true);
                }
                else {

                    Logger.info(userId,"reconnection :: >> call");
                    const userSignUp = await createOrFindUser({
                        socketId: socketId.toString(),
                        userId: userProfileData?.userId,
                        lobbyId: userProfileData.lobbyId,
                        gameId: userProfileData.gameId,
                        username: userProfileData.username,
                        profilePic: userProfileData.profilePic,
                        entryFee: Number(Number(userProfileData.entryFee) / NUMERICAL.EIGHTY),
                        noOfPlayer: userProfileData.noOfPlayer,
                        gameType: userProfileData.gameType,
                        isUseBot: userProfileData.isUseBot,
                        isFTUE: userProfileData.isFTUE,
                        authToken: socket.authToken || userProfileData.authToken,
                        isAnyRunningGame: (isValidUserData && isValidUserData.isValidUser) ? isValidUserData.isAnyRunningGame : false,
                        latitude : userProfileData.latitude,
                        longitude : userProfileData.longitude
                    });
                    if (!userSignUp) throw new Errors.UnknownError('USER_SIGNUP_FAILED');

                    let userProfile = userSignUp.userProfile;
                    Logger.info(userId,"reconnection :: userProfile :::>>", userProfile);

                    const reconnectResponse = await reconnection(userProfileData.tableId, userProfileData.userId, userProfile, socket, ack);
                }
            } else {

                let response: any = await signUpHandler(socket, signUpDetails, isRejoinOrNewGame, ack);
                Logger.info(userId,"Before Join Table ::: response :: ==>>", response);
                if (response && 'tableId' in response && !response['reconnect'])
                await joinTable(response, socket, false);
                if (response && response['reconnect']) await joinTable(response, socket, true);
            }

        }
        Logger.info(userId,` Ending rejoinOrNewGameHandler :>> `);

        return true;
    }
    catch (error: any) {
        Logger.error(userId,`rejoinOrNewGameHandler Error :: ${error}`)

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
                    tableId : EMPTY,
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
                    tableId : EMPTY,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        } else {
            CommonEventEmitter.emit(EVENTS.REJOIN_OR_NEW_GAME_SOCKET_EVENT, {
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
    // finally {
    //     try {
    //         if (lock) await Lock.getLock().release(lock);
    //     } catch (error) {
    //         Logger.error(error, ' rejoinOrNewGameHandler ');
    //     }
    // }
}

export = rejoinOrNewGameHandler;
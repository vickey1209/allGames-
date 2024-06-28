import { SignupInput } from "../../interfaces/signup";
import Logger from "../../logger";
import { EMPTY, EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../../constants";
import CommonEventEmitter from '../../commonEventEmitter';
import { tableGamePlayCache, userProfileCache } from "../../cache";
import leaveTableHandler from "../../requestHandlers/leaveTableHandler";

async function checkOldTableExist(socket: any, signUpData: SignupInput) {
    const { userId } = signUpData;
    const socketId = socket.id;

    try {
        Logger.info(userId,`Starting checkOldTableExist for userId : ${userId}`);
        let isUserJoinOtherLobby = false;

        let userProfileData = await userProfileCache.getUserProfile(userId);
        if (!userProfileData) { return isUserJoinOtherLobby; }

        Logger.info(userId,'get userProfileData :==>> ', JSON.stringify(userProfileData));
        Logger.info(userId,' signUpData :==>> ', JSON.stringify(signUpData));

        if (signUpData.lobbyId !== userProfileData?.lobbyId && userProfileData?.lobbyId !== EMPTY) {

            if (userProfileData.tableId) {

                const tableGamePlay = await tableGamePlayCache.getTableGamePlay(userProfileData.tableId);
                if (!tableGamePlay) { return isUserJoinOtherLobby; }

                if (
                    tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED &&
                    tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD
                ) {
                    isUserJoinOtherLobby = true;
                    CommonEventEmitter.emit(EVENTS.REJOIN_POPUP_SOCKET_EVENT, {
                        socket: socketId,
                        data: {
                            message: MESSAGES.ERROR.REJOIN_PREVIOUS_TABLE,
                            rejoinUserData: userProfileData,
                            tableId : userProfileData.tableId,
                        }
                    });
                } else {
                    await leaveTableHandler(socket, {
                        userId,
                        tableId: userProfileData.tableId,
                        currentRound: NUMERICAL.ONE,
                        isLeaveFromScoreBoard : false
                    })
                    return isUserJoinOtherLobby;
                }
            }

        }
        Logger.info(userId,`Ending checkOldTableExist for userId : ${userId}`, "isUserJoinOtherLobby :: ==>", isUserJoinOtherLobby);

        return isUserJoinOtherLobby;

    } catch (error: any) {
        Logger.error(userId,"<<======= checkOldTableExist() Error ======>>", error);

        // let msg = MESSAGES.ERROR.COMMON_ERROR;
        // let nonProdMsg = "";
        // let errorCode = 500;

        // if (error instanceof Errors.InvalidInput) {
        //     nonProdMsg = "Invalid Input";
        //     CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        //         socket: socketId,
        //         data: {
        //             isPopup: true,
        //             popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
        //             title: nonProdMsg,
        //             message: msg,
        //             tableId,
        //             buttonCounts: NUMERICAL.ONE,
        //             button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
        //             button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
        //             button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        //         },
        //     });
        // } else if (error instanceof Errors.UnknownError) {
        //     nonProdMsg = "FAILED";

        //     CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        //         socket: socketId,
        //         data: {
        //             isPopup: true,
        //             popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
        //             title: nonProdMsg,
        //             message: msg,
        //             tableId,
        //             buttonCounts: NUMERICAL.ONE,
        //             button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
        //             button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
        //             button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        //         },
        //     });
        // } 

        throw new Error(`function  checkOldTableExist error ${error}`)

    }
}

export = checkOldTableExist;
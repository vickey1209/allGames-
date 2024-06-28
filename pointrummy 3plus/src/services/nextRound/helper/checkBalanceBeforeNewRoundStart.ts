import { playerGamePlayCache, tableGamePlayCache, userProfileCache } from "../../../cache";
import { checkBalance, getUserOwnProfile } from "../../../clientsideapi";
import { EMPTY, EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE } from "../../../constants";
import Errors from "../../../errors";
import Logger from "../../../logger";
import CommonEventEmitter from '../../../commonEventEmitter';
async function checkBalanceBeforeNewRoundStart(userId: string, tableId: string) {
        Logger.info(tableId,"checkBalanceBeforeNewRoundStart   :: userId :>>" + userId, "tableId ::>>", tableId )
    try {
        const [playerGamePlay, tableGamePlay, userProfile] = await Promise.all([
            playerGamePlayCache.getPlayerGamePlay(userId, tableId),
            tableGamePlayCache.getTableGamePlay(tableId),
            userProfileCache.getUserProfile(userId)
        ])

        if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');
        if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
        if (!userProfile) throw new Errors.UnknownError('Unable to get user data');

        //check user balance
        let checkBalanceDetail: any = {};
        checkBalanceDetail = await checkBalance({ tournamentId: userProfile.lobbyId }, userProfile.authToken, userProfile.socketId, userId);
        Logger.info(tableId,"checkBalanceDetail  :: >> ", checkBalanceDetail);
        if (checkBalanceDetail && checkBalanceDetail.userBalance.isInsufficiantBalance) {
            Logger.info(tableId,"isInsufficiantBalance :: >>", checkBalanceDetail.userBalance.isInsufficiantBalance);
            let nonProdMsg = "Insufficient Balance !";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: userProfile.socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    tableId: EMPTY,
                    message: MESSAGES.ERROR.INSUFFICIENT_BALANCE,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });

            //player status update PGP and TGP
            for await (const ele of tableGamePlay.seats) {
                if (ele.userId === userProfile.userId) {
                    ele.userState = PLAYER_STATE.QUIT;
                }
            }
            playerGamePlay.userStatus = PLAYER_STATE.QUIT;

            await Promise.all([
                playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
                tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
            ])        
        }

        //all user balances updated;
        const userOwnProfile = await getUserOwnProfile(userProfile.authToken, userProfile.socketId, userId);
        Logger.info(tableId,"userOwnProfile  :: >> ", userOwnProfile);
        const balance: number = userOwnProfile.winCash + userOwnProfile.cash;
        userProfile.balance = balance;
        await userProfileCache.setUserProfile(userId, userProfile);

        return true;

    } catch (error: any) {
        Logger.error(tableId,`checkBalanceBeforeNewRoundStart Error :: ${error}`)
        return true;
    }
}

export = checkBalanceBeforeNewRoundStart;
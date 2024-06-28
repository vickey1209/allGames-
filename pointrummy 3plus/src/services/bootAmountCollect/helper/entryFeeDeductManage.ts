import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../../../cache";
import { getUserOwnProfile } from "../../../clientsideapi";
import { multiPlayerDeductEntryFee } from "../../../clientsideapi/multiPlayerDeductEntryFee";
import { EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE } from "../../../constants";
import { formatBootCollectData } from "../../../formatResponseData";
import { multiPlayerDeductEntryFeeResponse } from "../../../interfaces/cmgApiIf";
import { UserProfileOutput } from "../../../interfaces/userProfile";
import Logger from "../../../logger";
import CommonEventEmitter from '../../../commonEventEmitter';
import leaveTableHandler from "../../../requestHandlers/leaveTableHandler";
import { seatsInterface } from "../../../interfaces/signup";


async function entryFeeDeductManage(tableId: string, currentRound: number) {
    try {

        Logger.info(tableId, `Starting entryFeeDeductManage for tableId : ${tableId}`);

        const [tableConfig, tableGamePlay] = await Promise.all([
            tableConfigCache.getTableConfig(tableId),
            tableGamePlayCache.getTableGamePlay(tableId)
        ]);
        if (!tableGamePlay || !tableConfig) throw Error('Unable to get table data');

        Logger.info("entryFeeDeductManage :: tableGamePlay  :: ==>> ", tableGamePlay);
        Logger.info("entryFeeDeductManage :: tableConfig  :: ==>> ", tableConfig);


        // NEW FLOW : table wise entry fee deduct
        const playingUserIds: string[] = [];
        tableGamePlay.seats.map((ele) => {
            if (ele.userState === PLAYER_STATE.PLAYING) {
                playingUserIds.push(ele.userId);
            }
        })
        Logger.info(tableId, " playingUserIds :: ", playingUserIds);

        const apiData = {
            tableId,
            tournamentId: tableConfig.lobbyId,
            userIds: playingUserIds
        }

        const userProfile = await userProfileCache.getUserProfile(playingUserIds[NUMERICAL.ZERO]) as UserProfileOutput;
        const multiPlayerDeductEntryFeeData: multiPlayerDeductEntryFeeResponse = await multiPlayerDeductEntryFee(apiData, userProfile.authToken, userProfile.socketId);

        const { isMinPlayerEntryFeeDeducted, deductedUserIds, notDeductedUserIds } = multiPlayerDeductEntryFeeData;
        // let { isMinPlayerEntryFeeDeducted, deductedUserIds, notDeductedUserIds } = multiPlayerDeductEntryFeeData;
        // isMinPlayerEntryFeeDeducted = true;
        // deductedUserIds = ["646c3979e324e897f39bec9b", "646c39bfe324e897f39becdb"];
        // notDeductedUserIds = ["646c39a9e324e897f39becbb"];

        Logger.info(" isMinPlayerEntryFeeDeducted :: >> ", isMinPlayerEntryFeeDeducted);
        Logger.info(" deductedUserIds :: >> ", deductedUserIds);
        Logger.info(" notDeductedUserIds :: >> ", notDeductedUserIds);
        Logger.info(" tableConfig.minPlayer :: >> ", tableConfig.minPlayer);

        if (isMinPlayerEntryFeeDeducted && deductedUserIds.length >= tableConfig.minPlayer) {

            let collectBootArray: seatsInterface[] = [];
            for (let v = 0; v < deductedUserIds.length; v++) {
                for (let i = 0; i < tableGamePlay.seats.length; i++) {
                    const element = tableGamePlay.seats[i];
                    if (element.userId == deductedUserIds[v]) {
                        collectBootArray.push(element);
                    }
                }
            }
            Logger.info("collectBootArray  :: ===>> ", collectBootArray);

            let collectBootValueSIArray = collectBootArray.map((element) => { return element.si; })
            Logger.info("collectBootValueSIArray  :: ===>> ", collectBootValueSIArray);

            for (let v = 0; v < deductedUserIds.length; v++) {

                const [userProfile, playerGamePlay] = await Promise.all([
                    userProfileCache.getUserProfile(deductedUserIds[v]),
                    playerGamePlayCache.getPlayerGamePlay(deductedUserIds[v], tableId)
                ]);
                if (!userProfile) throw Error('Unable to get user data');
                if (!playerGamePlay) throw Error('Unable to get player data');

                if (playerGamePlay.userStatus === PLAYER_STATE.PLAYING) {

                    const userOwnProfile = await getUserOwnProfile(userProfile.authToken, userProfile.socketId, userProfile.userId);
                    const updatedBalance: number = userOwnProfile.winCash + userOwnProfile.cash || 0;
                    userProfile.balance = updatedBalance;
                    await userProfileCache.setUserProfile(deductedUserIds[v], userProfile);

                    const data = await formatBootCollectData(tableConfig, tableGamePlay, collectBootValueSIArray, updatedBalance, tableId);
                    CommonEventEmitter.emit(EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT, {
                        socket: userProfile.socketId,
                        data,
                        tableId
                    });
                }

            }
        }
        
        if (notDeductedUserIds.length > NUMERICAL.ZERO) {
            //popup send and leave table 
            for (let i = 0; i < notDeductedUserIds.length; i++) {
                const userProfile = await userProfileCache.getUserProfile(notDeductedUserIds[i]);
                if (!userProfile) throw Error('Unable to get user data');
                Logger.info("Starting notDeductedUserIds  :: leaveTableHandler  :: " + notDeductedUserIds[i]);

                let msg = MESSAGES.ERROR.ENTRY_FEE_DEDUCTED_MSG;
                let nonProdMsg = "FAILED!";

                CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                    socket: userProfile.socketId,
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

                await leaveTableHandler(
                    { id: userProfile.socketId, tableId: tableId, userId: notDeductedUserIds[i] },
                    { userId: notDeductedUserIds[i], tableId, currentRound: NUMERICAL.ONE, isLeaveFromScoreBoard : false }
                );

            }
        }

        Logger.info(tableId, `Ending entryFeeDeductManage for tableId : ${tableId}`);
        if(!isMinPlayerEntryFeeDeducted){  return false; }
        return true;

    } catch (error) {

        Logger.error(tableId,
            error,
            ` table ${tableId} round ${currentRound} funciton entryFeeDeductManage`
        );
        throw new Error(`INTERNAL_ERROR_entryFeeDeductManage() ${error}`);

    }
}

export = entryFeeDeductManage;

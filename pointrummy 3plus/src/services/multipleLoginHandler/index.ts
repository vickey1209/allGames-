
import Logger from "../../logger";
const CryptoJS = require("crypto-js");
import { getConfig } from "../../config";
import leaveTableHandler from "../../requestHandlers/leaveTableHandler";
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../../cache";
const { SECRET_KEY } = getConfig();
import Errors from "../../errors";
import { EMPTY, EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../../constants";
import CommonEventEmitter from '../../commonEventEmitter';

async function multipleLoginHandler(req: any, res: any) {
    try {
        Logger.info('multipleLoginHandler :: req.body  :::', req.body);

        const authKey = req.headers["authorization"];
        Logger.info("multipleLoginHandler :: authKey  :::", authKey);
        let userId = CryptoJS.AES.decrypt(authKey, SECRET_KEY).toString(CryptoJS.enc.Utf8);
        Logger.info("multipleLoginHandler :: userId :::", userId);

        if (!userId) {
            const resObj = {
                status: 400,
                success: true,
                message: "oops ! Something want wrong",
                data: null
            }
            return res.send(resObj);
        }

        const userProfile = await userProfileCache.getUserProfile(userId);
        if (!userProfile) throw new Errors.UnknownError('Unable to get user Profile ');
        if(req.body && req.body.token){
            userProfile.authToken = req.body.token;
            await userProfileCache.setUserProfile(userId, userProfile);
        }

        if (userProfile && userProfile.tableId != EMPTY) {

            const [tableConfig, tableGamePlay, playerGamePlay] = await Promise.all([
                tableConfigCache.getTableConfig(userProfile.tableId),
                tableGamePlayCache.getTableGamePlay(userProfile.tableId),
                playerGamePlayCache.getPlayerGamePlay(userId, userProfile.tableId),
            ]);

            if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table game play');
            if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player game play');
            if (!tableConfig) throw new Errors.UnknownError('Unable to get player game play');

            if (
                tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED &&
                tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD
            ) {
                await leaveTableHandler({ id: userProfile?.socketId, tableId: userProfile.tableId, userId: userId }, { userId : userId, tableId: userProfile.tableId, currentRound: NUMERICAL.ONE, isLeaveFromScoreBoard: false });
            } else {
                let msg = MESSAGES.ERROR.MULTIPLE_LOGIN_FAILED_MSG;
                let nonProdMsg = "";
                let errorCode = 500;
                nonProdMsg = "FAILED";

                CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                    socket: userProfile.socketId,
                    data: {
                        isPopup: true,
                        popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                        title: nonProdMsg,
                        message: msg,
                        tableId: userProfile.tableId,
                        buttonCounts: NUMERICAL.ONE,
                        button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                        button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                        button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                    },
                });
            }
            const resObj = {
                status: 200,
                success: true,
                message: "sucessfully",
                data: null
            }
            return res.send(resObj);
        }
        else {
            throw new Errors.UnknownError('Unable user in table seats');
        }

    } catch (error) {
        Logger.error('multipleLoginHandler :>> ', error);
        const resObj = {
            status: 400,
            message: "oops ! Something want wrong",
            data: null
        }
        return res.send(resObj);
    }
}

export = multipleLoginHandler;
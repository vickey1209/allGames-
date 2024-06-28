import { EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../constants";
import CommonEventEmitter from '../../commonEventEmitter';
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../../cache";
import { UserProfileOutput } from "../../interfaces/userProfile";
import { seatsInterface } from "../../interfaces/signup";
import { getUserProfile } from "../../cache/userProfile";
import Logger from "../../logger"
import { formatNewScoreBoardData } from "../../formatResponseData";
import { diffSeconds } from "../../common";
import { scoreBoardResponse, userResDataInterface } from "../../interfaces/tableConfig";
import scoreBoardManage from "../winner/helper/scoreBoardManage";


async function rejoinPopupManage(userId: string, tableId: string, socketId: string) {

    try {

        const [playerGamePlay, tableGamePlay, tableConfig, userProfile] = await Promise.all([
            playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId),
            tableGamePlayCache.getTableGamePlay(tableId),
            tableConfigCache.getTableConfig(tableId),
            getUserProfile(userId)
        ]);

        if (!tableGamePlay) throw Error('tableGamePlay not found !');
        if (!tableConfig) throw Error('tableConfig not found !');
        if (!userProfile) throw Error('user not found!');
        if (!playerGamePlay) throw Error('playerGamePlay not found !');

        //all pop up handle : continue display in game screen.
        if (playerGamePlay.userStatus === PLAYER_STATE.DECLAREING) {

            let nonProdMsg = "declareing timer start";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOP_TOAST_POPUP,
                    title: nonProdMsg,
                    message: MESSAGES.ERROR.PLEASE_GROUP_YOUR_CARDS_AND_DECLARE,
                    showTimer: false,
                    tableId,
                },
            });

        }
        if (playerGamePlay.userStatus === PLAYER_STATE.WRONG_SHOW) {

            let nonProdMsg = "you made an invalid declare";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOP_TOAST_POPUP,
                    title: nonProdMsg,
                    message: MESSAGES.ERROR.YOU_MADE_AN_INVALID_DECLARE,
                    showTimer: false,
                    tableId,
                },
            });

        }
        if (tableGamePlay.tableState === TABLE_STATE.DECLARED) {

            let validDeclareUser: seatsInterface = tableGamePlay.seats.filter(x => x.userState == PLAYER_STATE.WON)[0];

            for (let i = 0; i < tableGamePlay.seats.length; i++) {
                const ele = tableGamePlay.seats[i];
                const userPGP: UserProfileOutput | null = await userProfileCache.getUserProfile(ele.userId);
                if (ele.userState == PLAYER_STATE.PLAYING && ele.userId === userId) {
                    let nonProdMsg = "Valid Declaration";
                    CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                        socket: userPGP?.socketId,
                        data: {
                            isPopup: true,
                            popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOP_TOAST_POPUP,
                            title: nonProdMsg,
                            message: `Player ${validDeclareUser.name} ${MESSAGES.ERROR.HAS_MADE_A_VALID_DECLARATION} ${MESSAGES.ERROR.PLEASE_GROUP_YOUR_CARDS_AND_DECLARE}`,
                            showTimer: false,
                            tableId,
                        },
                    });

                }

            }

        }
        if (playerGamePlay.userStatus === PLAYER_STATE.WATCHING) {

            let nonProdMsg = "user in watching mode";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.BOTTOM_TOAST_POPUP,
                    title: nonProdMsg,
                    message: MESSAGES.ERROR.YOU_ARE_SEAT_IN_WATCHING_MODE_PLEASE_WAITING_FOR_NEW_GAME_START,
                    showTimer: false,
                    tableId,
                },
            });


        }

        if (tableGamePlay.tableState === TABLE_STATE.DECLARED) {


            let rTimer: number = NUMERICAL.ZERO;
            rTimer = diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) * NUMERICAL.THOUSAND;
            if (tableGamePlay.tableState === TABLE_STATE.DECLARED) {
                rTimer = Math.ceil(tableConfig.declareTimer - rTimer) / NUMERICAL.THOUSAND;
            }
            console.log('rTimer :===>> ', rTimer);

            const allUserPGP: userResDataInterface[] = await scoreBoardManage(userId, tableId) as userResDataInterface[];
            for (let i = 0; i < tableGamePlay.seats.length; i++) {
                const element = tableGamePlay.seats[i];
                if (element.userId == userId && element.userState !== PLAYER_STATE.PLAYING && element.userState !== PLAYER_STATE.WATCHING_LEAVE && element.userState !== PLAYER_STATE.QUIT) {
                    console.log(' rejoinPopupManage  element : ==>>> ', element);
                    let scoreData: scoreBoardResponse;
                    scoreData = await formatNewScoreBoardData(tableId, allUserPGP, tableGamePlay.trumpCard, rTimer, true);
                    CommonEventEmitter.emit(EVENTS.SCORE_BOARD_CLIENT_SOCKET_EVENT, {
                        socket: socketId,
                        tableId: tableId,
                        data: scoreData
                    });
                }
            }
        }

        // if (tableGamePlay.tableState === TABLE_STATE.LOCK_IN_PERIOD) {
        //     if (playerGamePlay.userStatus !== PLAYER_STATE.WATCHING) {
        //         CommonEventEmitter.emit(EVENTS.LOCK_IN_PERIOD_SOCKET_EVENT, {
        //             socket: socketId,
        //             data: {
        //                 tableId,
        //                 currentRound: NUMERICAL.ONE,
        //                 msg: MESSAGES.ERROR.LOCK_IN_PEROID_MSG,
        //             },
        //         });
        //     }
        // }

    } catch (error) {
        Logger.info(tableId, " rejoinPopupManage() :: ERROR :=> " + error);
    }
}

export = rejoinPopupManage;
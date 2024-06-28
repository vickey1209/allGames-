import { playerGamePlayCache, tableConfigCache, tableGamePlayCache } from "../../../cache";
import { EMPTY, NUMERICAL, PLAYER_STATE } from "../../../constants";
import { manageAndUpdateDataInterface } from "../../../interfaces/manageAndUpdateData";
import { defaulPlayerGamePlayInterface } from "../../../interfaces/playerGamePlay";
import { userResDataInterface } from "../../../interfaces/tableConfig";
import Logger from "../../../logger";
import manageAndUpdateData from "../../../utils/manageCardData";
import Errors from "../../../errors";



async function scoreBoardManage(userId: string, tableId: string) {
    try {

        const [tableGamePlay, tableConfig] = await Promise.all([
            tableGamePlayCache.getTableGamePlay(tableId),
            tableConfigCache.getTableConfig(tableId)
        ])
        if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
        if (!tableConfig) throw new Errors.UnknownError('Unable to get table data');

        let winnerUserId: string = "";
        let winnerSI: number = NUMERICAL.MINUS_ONE;
        let allUserPGP: userResDataInterface[] = [];
        let winnerAmount: number = NUMERICAL.ZERO;

        for (let i = 0; i < tableGamePlay.seats.length; i++) {
            const userData = tableGamePlay.seats[i];
            let userResData = <userResDataInterface>{};

            const userPGP: defaulPlayerGamePlayInterface | null = await playerGamePlayCache.getPlayerGamePlay(userData.userId, tableId);
            Logger.info(tableId, " scoreBoardManage:: userPGP ===>> ", userPGP);
            if (userPGP != null && (userPGP.userStatus != PLAYER_STATE.WATCHING && userPGP.userStatus != PLAYER_STATE.WATCHING_LEAVE)) {
                const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
                    await manageAndUpdateData(userPGP.currentCards, userPGP);
                userResData.userId = userData.userId;
                userResData.si = userData.si;
                userResData.pp = userData.pp;
                userResData.userName = userData.name;
                userResData.cards = cards;
            }

            if (userPGP != null && userData.userId === userId && userPGP.userStatus == PLAYER_STATE.WON) {
                winnerUserId = userData.userId;
                winnerSI = userData.si
                userResData.amount = EMPTY;
                userResData.result = PLAYER_STATE.WON;
                userResData.score = NUMERICAL.ZERO;
                userResData.isDeclared = true;
            }
            else if (userPGP != null && userPGP.userStatus == PLAYER_STATE.WON) {
                userResData.amount = EMPTY;
                userResData.result = PLAYER_STATE.WON;
                userResData.score = NUMERICAL.MINUS_ONE;
                userResData.isDeclared = true;
            }
            else if (userPGP != null && userPGP.userStatus == PLAYER_STATE.PLAYING) {
                userResData.amount = EMPTY;
                userResData.result = PLAYER_STATE.DECLAREING;
                userResData.score = NUMERICAL.MINUS_ONE;
                userResData.isDeclared = false;
            }
            else if (userPGP != null && userPGP.userStatus == PLAYER_STATE.QUIT) {
                userResData.amount = `-${(Number(tableConfig.entryFee) * NUMERICAL.EIGHTY).toFixed(2)}`;
                userResData.result = PLAYER_STATE.LEAVE;
                userResData.score = NUMERICAL.EIGHTY;
                userResData.isDeclared = true;
            }
            else if (userPGP != null && userPGP.userStatus == PLAYER_STATE.DROP) {
                userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
                userResData.result = PLAYER_STATE.DROP;
                userResData.score = userPGP.dropScore;
                userResData.isDeclared = true;
            }
            else if (userPGP != null && (userPGP.userStatus == PLAYER_STATE.WRONG_SHOW)) {
                userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
                userResData.result = PLAYER_STATE.WRONG_SHOW;
                userResData.score = NUMERICAL.EIGHTY;
                userResData.isDeclared = true;
            }
            else if (userPGP != null && userPGP.userStatus == PLAYER_STATE.LOSS) {
                userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
                userResData.result = PLAYER_STATE.LOSS;
                userResData.score = Number(userPGP.cardPoints);
                userResData.isDeclared = true;
            }
            else {
                Logger.info(tableId, "<<=== No user state found  ===>>");
            }
            Logger.info(tableId, " userResData ==>>", userResData);
            if (userResData.userId) {
                allUserPGP.push(userResData);
            }
        }
        Logger.info(tableId, " scoreBoardManage allUserPGP ::==>>", allUserPGP);
        return allUserPGP;

    } catch (error) {
        Logger.info(tableId, "scoreBoardManage() Error : ", error);
    }


}

export = scoreBoardManage;
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache } from "../../../cache";
import { NUMERICAL, PLAYER_STATE } from "../../../constants";
import Errors from "../../../errors";
import Logger from "../../../logger";
import dropLogic from "../../../utils/dropLogic";

async function dropAndMoveManage(tableId: string, userId: string) {

    try {

        const [tableConfig, tableGamePlay, playerGamePlay] = await Promise.all([
            tableConfigCache.getTableConfig(tableId),
            tableGamePlayCache.getTableGamePlay(tableId),
            playerGamePlayCache.getPlayerGamePlay(userId, tableId)
        ])

        if (!tableConfig) throw new Errors.UnknownError('Unable to get userProfile data');
        if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table data');
        if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player data');
        playerGamePlay.isDropAndMove = true;

        if (playerGamePlay.userStatus === PLAYER_STATE.PLAYING) {

            const dropScore = await dropLogic(tableId, userId) as number;
            playerGamePlay.userStatus = PLAYER_STATE.DROP;
            playerGamePlay.looseingCash = dropScore * tableConfig.entryFee;
            playerGamePlay.dropScore = dropScore;

            //user cards make in one group
            let newArr: string[] = [];
            for (let i = 0; i < playerGamePlay.currentCards.length; i++) {
                const ele = playerGamePlay.currentCards[i];
                newArr = newArr.concat(ele);
            }
            playerGamePlay.currentCards = [newArr];
            // const PlayingPlayersCount = await countPlayingPlayers(tableGamePlay);
            // Logger.info("PlayingPlayersCount  ::>> ", PlayingPlayersCount);

            // if (PlayingPlayersCount >= NUMERICAL.TWO) {
            tableGamePlay.currentPlayerInTable -= NUMERICAL.ONE;
            // }
            for await (const seat of tableGamePlay.seats) {
                if (seat.userId == userId) {
                    seat.userState = PLAYER_STATE.DROP;
                }
            }
            Logger.info("dropAndMoveManage :: tableGamePlay.seats  ::=>> ", tableGamePlay.seats)

        }

        await Promise.all([
            tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
            playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
            tableConfigCache.setTableConfig(tableId, tableConfig)
        ]);

    } catch (error: any) {
        Logger.error(tableId, `dropAndMoveManage Error :: ${error}`)
        Logger.info(tableId, "<<======= dropAndMoveManage() Error ======>>", error);
    }
}

export = dropAndMoveManage;
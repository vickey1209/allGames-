import Logger from "../../../logger";
import { insertPlayerGamePlay } from "../../../cache/playerGamePlay"
import { defaulPlayerGamePlayInterface } from "../../../interfaces/playerGamePlay";
import { EMPTY, NUMERICAL, PLAYER_STATE } from "../../../constants";
const { ObjectID } = require("mongodb")

function reSetPlayerGamePlayData(
    userId: string,
    seatIndex: number,
    username: string,
    profilePic: string,
    userStatus: string,
): defaulPlayerGamePlayInterface {
    const currentTimestamp = new Date();
    return {
        _id: ObjectID().toString(),
        userId,
        username,
        profilePic,
        seatIndex,
        userStatus: (userStatus) ? userStatus : PLAYER_STATE.WATCHING,
        playingStatus : EMPTY,
        tCount: NUMERICAL.ZERO,
        cardPoints: NUMERICAL.ZERO,
        lastPickCard: EMPTY,
        pickFromDeck: EMPTY,
        currentCards: [],
        groupingCards: {
            pure: [],
            impure: [],
            set: [],
            dwd: [],
        },
        turnTimeOut: NUMERICAL.ZERO,
        seconderyTimerCounts: NUMERICAL.ZERO,
        // useRejoin: isRejoin || false,
        winningCash: NUMERICAL.ZERO,
        looseingCash: NUMERICAL.ZERO,
        isDropAndMove : false,
        ispickCard : false,
        dropScore : NUMERICAL.MINUS_ONE,
        createdAt: currentTimestamp.toString(),
        updatedAt: currentTimestamp.toString(),
    };
}


async function reSetPlayerGamePlay(
    userId: string,
    tableId: string,
    seatIndex: number,
    username: string,
    profilePic: string,
) {
    try {
        const reSetPlayerGamePlay = await reSetPlayerGamePlayData(
            userId,
            seatIndex,
            username,
            profilePic,
            PLAYER_STATE.PLAYING
            )
            await insertPlayerGamePlay(reSetPlayerGamePlay, tableId)
            Logger.info(tableId,` reSetPlayerGamePlay :: reSetPlayerGamePlay :: >>`,reSetPlayerGamePlay)

    } catch (error) {
        Logger.info(tableId,error)
        Logger.error(tableId,"--- reSetPlayerGamePlay :: ERROR :: " + error)
    }
}

export = reSetPlayerGamePlay;
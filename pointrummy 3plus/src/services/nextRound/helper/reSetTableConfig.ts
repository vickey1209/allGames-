import { getTableConfig, setTableConfig } from "../../../cache/tableConfig";
import { getConfig } from "../../../config";
import { NUMERICAL } from "../../../constants";
import { defaultTableConfig } from "../../../interfaces/tableConfig";
import logger from "../../../logger";
const { ObjectID } = require("mongodb")
const { GAME_START_TIMER, USER_TURN_TIMER, SECONDARY_TIMER, DECLARE_TIMER } = getConfig();

function defaulTableData(
    tableConfig: defaultTableConfig,
): defaultTableConfig {
    const currentTimestamp = new Date();
    return {
        _id: ObjectID().toString(),     /*String(GetRandomInt(1000000000, 9999999999)),*/
        gameType: tableConfig.gameType,
        currentRound: NUMERICAL.ONE,
        lobbyId: tableConfig.lobbyId,
        gameId : tableConfig.gameId,
        multiWinner: false,
        maximumPoints: NUMERICAL.EIGHTY,
        minPlayer: tableConfig.minPlayer,
        noOfPlayer: tableConfig.noOfPlayer,
        gameStartTimer: Number(GAME_START_TIMER),
        userTurnTimer: Number(USER_TURN_TIMER),
        secondaryTimer: Number(SECONDARY_TIMER),
        declareTimer: Number(DECLARE_TIMER),
        entryFee: tableConfig.entryFee,
        moneyMode: tableConfig.moneyMode,
        numberOfDeck: NUMERICAL.TWO,
        createdAt: currentTimestamp.toString(),
        updatedAt: currentTimestamp.toString(),
    };
}

async function reSetTableConfig(tableId: string) {
    try {
        logger.info(tableId,"reSetTableConfig ::>> TableId: " + tableId)
        const tableConfigInfo = await getTableConfig(tableId) as defaultTableConfig;
        // await deleteTableConfig(tableId)
        const tableConfig = await defaulTableData(tableConfigInfo)
        await setTableConfig(tableConfig._id, tableConfig)
        logger.info(tableId,"reSetTableConfig :: reSettableConfig :: >> " + tableConfig)
        return tableConfig;
    } catch (error) {
        logger.error(tableId,"--- setTableConfig :: ERROR ::", error)
        throw error;
    }
}

export = reSetTableConfig;
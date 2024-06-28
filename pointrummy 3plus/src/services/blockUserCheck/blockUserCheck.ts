import { EMPTY, NUMERICAL } from "../../constants";
import redis from '../../cache/redisCommon';
import Logger from "../../logger";
import { tableConfigCache, tableGamePlayCache } from "../../cache";
import { checkUserBlockStatus } from "../../clientsideapi";
import { blockUserCheckI } from "../../interfaces/cmgApiIf";
import { CreateTableI } from "../../interfaces/signup";
import { setupFirstRound } from "../round";
import getAvailableTable from "../playTable/getAvailableTable";
import { createTable } from "../playTable/createTable";

async function blockUserCheck(tableId: string, signUpData: CreateTableI, key: string): Promise<blockUserCheckI | null> {

    //block User Check fetures
    try {
        Logger.info(tableId, "Starting block user check : >> tableId :: >>", tableId, "signUpData :: >>", signUpData, "key :: >>", key);
        const [tableGamePlay, tableConfig] = await Promise.all([
            await tableGamePlayCache.getTableGamePlay(tableId),
            await tableConfigCache.getTableConfig(tableId)
        ])
        if (!tableConfig) throw Error('Unable to get table config data');
        if (!tableGamePlay) throw new Error('Unable to get table data');

        let isNewTableCreated = false;
        let tbId = tableId;
        let newTableId: string = EMPTY;
        const { seats } = tableGamePlay;
        let blockUserKey = `blockUserCheck:${signUpData.lobbyId}`;
        let activePlayerUserIdArray = <string[]>[];
        for await (const player of seats) { activePlayerUserIdArray.push(player.userId); }
        Logger.info(tableId, "activePlayerUserIdArray ::>>", activePlayerUserIdArray);

        if (tableGamePlay.seats.length >= NUMERICAL.ONE) {
            for await (const player of seats) {

                // redis block user key setup
                let getBlockArr: any = await redis.getValueFromKey(blockUserKey);
                let arrayData = getBlockArr && getBlockArr.tableId ? getBlockArr.tableId : [];
                arrayData.push(tbId);
                Logger.info(tableId," arrayData ==>> ", arrayData);
                await redis.setValueInKey(blockUserKey, { tableId: arrayData });
                
                
                let isUserBlock = await checkUserBlockStatus(activePlayerUserIdArray, signUpData.authToken, signUpData.socketId, tableId);
                Logger.info(tableId, "isUserBlock ::>>", isUserBlock);
                
                if (isUserBlock) {

                    //find other empty table, if not available table then create a new one;
                    newTableId = await getAvailableTable(key, signUpData.noOfPlayer,tableId);
                    Logger.info(tableId," newTableId :>> ", newTableId);
                    if (newTableId) {
                        return await blockUserCheck(newTableId, signUpData, key);
                    }
                    else {
                        Logger.info(tableId,"CREATE TABLE ==>>");
                        let newCreateTableId: string = await createTable(signUpData);
                        await setupFirstRound({ tableId: newCreateTableId, gameType: signUpData.gameType });
                        Logger.info(tableId,"newCreateTableId 1 :: ", newCreateTableId);
                        tbId = newCreateTableId;
                        isNewTableCreated = true;
                    }

                }
                else {
                    Logger.info(tableId, "not a blocking user :: working");

                    let getBlockArr: any = await redis.getValueFromKey(blockUserKey);
                    Logger.info(tableId," getBlockArr =>", getBlockArr);
                    let arrayData = getBlockArr && getBlockArr.tableId ? getBlockArr.tableId : [];
                    Logger.info(tableId," arrayData :: =>", arrayData, "index of array", arrayData.indexOf(tbId));
                    arrayData.splice(arrayData.indexOf(tbId), 1);
                    await redis.setValueInKey(blockUserKey, { tableId: arrayData });

                }

            }


        }
        Logger.info(tableId, "tbId of From =>", tbId);
        return { tableId: tbId, isNewTableCreated };

    } catch (error: any) {
        Logger.info(tableId, " blockUserCheck() :: ERROR ==>>", error);
        return null;
    }

}


export = blockUserCheck;





import disctanceCalculation from "./disctanceCalculation";
import { tableConfigCache, tableGamePlayCache, userProfileCache } from "../../cache";
import { EMPTY, NUMERICAL, PLAYER_STATE } from "../../constants";
import { CreateTableI } from "../../interfaces/signup";
import getAvailableTable from "../playTable/getAvailableTable"
import redis from '../../cache/redisCommon';
import setupFirstRound from "../round/setupRound";
import Logger from "../../logger";
import { createTable } from "../playTable/createTable";

async function locationDistanceCheck(tableId: string, signUpData: CreateTableI, key: string, rangeRediusCheck : number): Promise<string> {

    //location fetures
    try {

        const [tableGamePlay, tableConfig] = await Promise.all([
            await tableGamePlayCache.getTableGamePlay(tableId),
            await tableConfigCache.getTableConfig(tableId)
        ])
        let tbId = tableId;
        if (!tableConfig) throw Error('Unable to get table config data');
        if (!tableGamePlay) throw new Error('Unable to get table data');

        const { latitude, longitude } = signUpData;
        let newTableId: string = EMPTY;
        let locationKey = `LocationCheck:${signUpData.lobbyId}`;
        if (tableGamePlay.seats.length >= NUMERICAL.ONE) {

            for (let i = 0; i < tableGamePlay.seats.length; i++) {
                const ele = tableGamePlay.seats[i];
                Logger.info(tableId," PLAYER_STATE ", ele, "length ", tableGamePlay.seats.length);

                if (ele.userState == PLAYER_STATE.PLAYING) {
                    const userData = await userProfileCache.getUserProfile(ele.userId.toString());
                    if (!userData) throw new Error('Unable to get user data')

                    Logger.info(tableId," latitude ",latitude, "longitude ",longitude, "userData.latitude", userData.latitude, "userData.longitude", userData.longitude);
                    let distanceFind: number = disctanceCalculation(Number(latitude), Number(longitude), Number(userData.latitude), Number(userData.longitude));
                    const distanceToJoinInTable: number = Number(rangeRediusCheck)
                    Logger.info(" Calculated distance Find =>> ", distanceFind);

                    // redis location key setup
                    let getLocationArr: any = await redis.getValueFromKey(locationKey);
                    let arrayData = getLocationArr && getLocationArr.tableId ? getLocationArr.tableId : [];
                    arrayData.push(tbId);
                    Logger.info(tableId," arrayData ==>> ", arrayData);
                    await redis.setValueInKey(locationKey, { tableId: arrayData });


                    if (distanceFind < distanceToJoinInTable) {

                        //find other empty table, if not available table then create a new one;
                        newTableId = await getAvailableTable(key, signUpData.noOfPlayer,tableId);
                        Logger.info(tableId," newTableId :>> ", newTableId);
                        if (newTableId) {
                            return await locationDistanceCheck(newTableId, signUpData, key, rangeRediusCheck);
                        }
                        else {
                            Logger.info(tableId,"CREATE TABLE ==>>");
                            let newCreateTableId: string = await createTable(signUpData);
                            await setupFirstRound({ tableId: newCreateTableId, gameType : signUpData.gameType});
                            Logger.info(tableId,"newCreateTableId 1 :: ", newCreateTableId);
                            tbId = newCreateTableId;
                        }
                    }
                    else {
                        let getLocationArr: any = await redis.getValueFromKey(locationKey);
                        Logger.info(tableId," getLocationArr =>", getLocationArr);
                        let arrayData = getLocationArr && getLocationArr.tableId ? getLocationArr.tableId : [];
                        Logger.info(tableId," arrayData :: =>", arrayData, "index of array", arrayData.indexOf(tbId));
                        arrayData.splice(arrayData.indexOf(tbId), 1);
                        await redis.setValueInKey(locationKey, { tableId: arrayData });
                    }
                }
                Logger.info(tableId,"tbId of From 2", tbId);
                tbId = tbId;
            }
        }
        Logger.info(tableId," locationDistanceCheck :: tbId of From", tbId);
        return tbId;

    } catch (error: any) {
        Logger.info(tableId," locationDistanceCheck() :: ERROR ==>>", error);
        return error
    }

}


export = locationDistanceCheck;


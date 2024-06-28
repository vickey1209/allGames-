import Logger from "../../logger"
import { CreateTableI } from '../../interfaces/signup';
import { TABLE_STATE, NUMERICAL, EMPTY } from '../../constants';
import { tableConfigCache, tableGamePlayCache, userProfileCache } from '../../cache';
import { setupFirstRound } from '../round';
import { locationDistanceCheck } from "../locationCheack";
import getAvailableTable from "./getAvailableTable";
import redis from '../../cache/redisCommon';
import { tableQueue } from "../../interfaces/tableConfig";
import { blockUserCheckI, rediusCheckDataRes } from "../../interfaces/cmgApiIf";
import { blockUserCheck } from "../blockUserCheck";
import { createTable } from "./createTable";
import { rediusCheck } from "../../clientsideapi/rediusCheck";


export async function findOrCreateTable(signUpData: CreateTableI): Promise<string> {
  const userId = signUpData.userId;
  try {
    let tableId: string = EMPTY;
    const key = `${signUpData.lobbyId}`;
    Logger.info(userId, `Starting findOrCreateTable for userId : ${signUpData.userId}`);

    //check get table, if same table get user play pervious game, then create new table.
    let userProfile = await userProfileCache.getUserProfile(signUpData.userId);
    if (!userProfile) throw new Error('Unable to get user profile');
    Logger.info(userId, "get userProfile : ==>> ", userProfile)
    const { oldTableId } = userProfile;

    if (userProfile && oldTableId.length !== NUMERICAL.ZERO) {
      Logger.info(userId, 'oldTableId  :>> ', oldTableId);
      let getTableQueueArr: tableQueue = await tableConfigCache.getTableFromQueue(key);
      Logger.info(userId, 'getTableQueueArr Before :>> ', getTableQueueArr);

      if (getTableQueueArr) {

        const newArrSet = new Set(oldTableId);
        const validTableIdArr = getTableQueueArr.tableId.filter((item) => {
          return !newArrSet.has(item);
        });

        Logger.info(userId, "validTableIdArr  ::==>> ", validTableIdArr);

        if (validTableIdArr.length != NUMERICAL.ZERO) {
          for (let index = 0; index < validTableIdArr.length; index++) {
            let tableIndex = userProfile.tableIds.findIndex((tblId: any) => tblId === validTableIdArr[index]);

            if (tableIndex === NUMERICAL.MINUS_ONE) {
              tableId = validTableIdArr[index];
              const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
              if (
                tableGamePlay && tableGamePlay.tableState != TABLE_STATE.DECLAREING &&
                tableGamePlay.tableState != TABLE_STATE.DECLARED &&
                tableGamePlay.tableState != TABLE_STATE.WINNER_DECLARED &&
                tableGamePlay.tableState != TABLE_STATE.SCORE_BOARD
              ) {
                let tableIdIndex = getTableQueueArr.tableId.indexOf(tableId);
                getTableQueueArr.tableId.splice(tableIdIndex, NUMERICAL.ONE);
                Logger.info(userId, 'after ==>> getTableQueueArr :>> ', getTableQueueArr);
                await tableConfigCache.setTableFromQueue(key, getTableQueueArr);
                break;
              } else {
                tableId = EMPTY;
              }
            }
          }

        } else {

          tableId = await createTable(signUpData);
          await setupFirstRound({ tableId: tableId, gameType: signUpData.gameType });
        }

      }
    }
    Logger.info(userId, 'tableId :: ==>> ', tableId, typeof tableId);

    if (!tableId) {
      tableId = await getAvailableTable(key, Number(signUpData.noOfPlayer), tableId);
      Logger.info(userId, "getAvailableTable : tableId ::", tableId);

      //user Exists In Previous Table check
      if (tableId) {
        let userExistsInPreviousTable = false;
        const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
        if (!tableGamePlay) throw new Error('Unable to get table data');

        for (let i = 0; i < tableGamePlay.seats.length; i++) {
          const ele = tableGamePlay.seats[i];
          if (ele.userId == signUpData.userId) { userExistsInPreviousTable = true; }
        }
        Logger.info(userId, 'userExistsInPreviousTable :>> ', userExistsInPreviousTable);

        if (
          userExistsInPreviousTable ||
          ( tableGamePlay && tableGamePlay.tableState === TABLE_STATE.DECLAREING ||
            tableGamePlay.tableState === TABLE_STATE.DECLARED ||
            tableGamePlay.tableState === TABLE_STATE.WINNER_DECLARED ||
            tableGamePlay.tableState === TABLE_STATE.SCORE_BOARD)
        ) {
          // add queue
          let getTableQueueArr: tableQueue = await tableConfigCache.getTableFromQueue(key);
          Logger.info(userId, 'before === getTableQueueArr :>> ', getTableQueueArr);
          getTableQueueArr.tableId.push(tableId);
          Logger.info(userId, 'after === getTableQueueArr :>> ', getTableQueueArr);
          await tableConfigCache.setTableFromQueue(key, getTableQueueArr);

          // then, create new table 
          tableId = await createTable(signUpData);
          Logger.info(userId, " createTable ::: tableId :::: ", tableId);
          await setupFirstRound({ tableId, gameType: signUpData.gameType });
        }
      }

    }
    if (!tableId) {
      tableId = await createTable(signUpData);
      Logger.info(userId, " createTable : tableId :: ", tableId);
      await setupFirstRound({ tableId, gameType: signUpData.gameType });
    }
    else {

      // blocking user check
      let blockUserData: blockUserCheckI | null = await blockUserCheck(tableId, signUpData, key);
      if (!blockUserData) throw new Error(`Could not block user`);

      Logger.info(`blockUserData :: >>`, blockUserData);
      tableId = blockUserData.tableId;

      //  push key into redis
      let blockUserKey = `blockUserCheck:${signUpData.lobbyId}`;
      let getBlockUserArr: any = await redis.getValueFromKey(blockUserKey);
      Logger.info("Block User : getBlockUserArr", getBlockUserArr);
      if (getBlockUserArr && getBlockUserArr.tableId.length > NUMERICAL.ZERO) {
        for (let i = 0; i < getBlockUserArr.tableId.length; i++) {

          // await redis.pushIntoQueue(`${signUpData.lobbyId}`, getBlockUserArr.tableId[i]);
          let key = `${signUpData.lobbyId}`;
          let getTableQueueArr: tableQueue = await tableConfigCache.getTableFromQueue(key);
          let arrayData = getTableQueueArr && getTableQueueArr.tableId ? getTableQueueArr.tableId : [];
          arrayData.push(getBlockUserArr.tableId[i]);
          await tableConfigCache.setTableFromQueue(key, { tableId: arrayData });

        }
        await redis.deleteKey(blockUserKey);
      }
      Logger.info(" blockUserCheck ==>> after", tableId);


      //location check Or redius check
      if (!blockUserData.isNewTableCreated) {


        const rediusCheckData: rediusCheckDataRes = await rediusCheck(signUpData.gameId, signUpData.authToken, userProfile.socketId, tableId);
        Logger.info("userData.isUseBot  ==>>>", signUpData.isUseBot);
        if (rediusCheckData) {

          let rangeRediusCheck: number = parseFloat(rediusCheckData.LocationRange);
          if (rediusCheckData && rediusCheckData.isGameRadiusLocationOn && rangeRediusCheck != NUMERICAL.ZERO && signUpData.isUseBot == false) {

            Logger.info("locationDistanceCheck=====>>before", tableId);
            tableId = await locationDistanceCheck(tableId, signUpData, key, rangeRediusCheck);

            // push key into redis
            let locationKey = `LocationCheck:${signUpData.lobbyId}`;
            let getLocationArr: any = await redis.getValueFromKey(locationKey);
            if (getLocationArr && getLocationArr.tableId.length > NUMERICAL.ZERO) {
              for (let i = 0; i < getLocationArr.tableId.length; i++) {

                // await redis.pushIntoQueue(`${signUpData.lobbyId}`, getLocationArr.tableId[i]);
                let key = `${signUpData.lobbyId}`;
                let getTableQueueArr: tableQueue = await tableConfigCache.getTableFromQueue(key);
                let arrayData = getTableQueueArr && getTableQueueArr.tableId ? getTableQueueArr.tableId : [];
                arrayData.push(getLocationArr.tableId[i]);
                await tableConfigCache.setTableFromQueue(key, { tableId: arrayData });

              }
              await redis.deleteKey(locationKey);
            }
            Logger.info("locationDistanceCheck=====>>after", tableId);

          }
        }

      }

    }

    Logger.info(userId, `Ending findOrCreateTable for userId : ${signUpData.userId} and tableId : ${tableId}`);

    return tableId;

  } catch (error: any) {
    Logger.error(userId, `Error in findOrCreateTable`, error);
    throw new Error(
      error && error.message && typeof error.message === 'string'
        ? error.message
        : `Error in findOrCreateTable`
    );
  }
}

// export = findOrCreateTable;


  // let isMatchTableId: boolean = getTableQueueArr.tableId.some(item => oldTableId.includes(item))
  // Logger.info('isMatchTableId :>> ', isMatchTableId);

  // if (isMatchTableId) {
  //   for (let i = 0; i < oldTableId.length; i++) {
  //     const ele = oldTableId[i];

  //     const tableGamePlay = await tableGamePlayCache.getTableGamePlay(ele);
  //       if (!tableGamePlay) throw new Error('Unable to get table data');
  //   }

  // let remaingTableId: string[] = getTableQueueArr.tableId.filter((ele) => ele !== userProfile?.oldTableId);
  // Logger.info('remaingTableId :>> ', remaingTableId);

  // if (remaingTableId.length === NUMERICAL.ZERO) {
  //   tableId = await createTable(signUpData);
  //   await setupFirstRound({ tableId: tableId, gameType : signUpData.gameType });
  // } else {
    // tableId = remaingTableId[NUMERICAL.ZERO];

  //   let tableIdIndex = getTableQueueArr.tableId.indexOf(tableId);
  //   getTableQueueArr.tableId.splice(tableIdIndex, NUMERICAL.ONE);
  //   Logger.info('after == getTableQueueArr :>> ', getTableQueueArr);
  //   await tableConfigCache.setTableFromQueue(key, getTableQueueArr);

  // }
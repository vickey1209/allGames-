// import { tableGamePlayCache } from "../../cache";
// import Logger from "../../logger"
// import redis from '../../cache/redisCommon';


// async function robotSeatInTable(
//   tableId :string
//   ): Promise<boolean> {
//     try {
//       Logger.info(`Starting robot seat in tableId : ${tableId}` );
//       Logger.info("<<==== Robot seat in table =====>>", tableId);
//       const KEY = `robot*`;
//       const data = await redis.getValueFromKey(KEY)
//       Logger.info("[==data", data) 
//       // const [allRobots, tableGamePlay] = await Promise.all([
//       //   global.redisClient.KEYS(KEY),
//       //   tableGamePlayCache.getTableGamePlay(tableId)
//       // // ]);
//       // Logger.info("====allRobots====", allRobots);

//       Logger.info(`Ending robot seat in tableId: ${tableId}`);
//       return false;
  
//     } catch (error: any) {
//       Logger.error( error, `table ${tableId} funtion robot seat in table` );
//       Logger.info("ERROR :: INTERNAL_ERROR_robotSeatInTable() ", error);
//       throw new Error(`INTERNAL_ERROR_robotSeatInTable()`);
//     }
//   }
  
//   const exportedObject = {
//     robotSeatInTable
//   };
  
//   export = exportedObject;
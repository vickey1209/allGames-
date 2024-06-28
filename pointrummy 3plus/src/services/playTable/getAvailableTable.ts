import { tableConfigCache, tableGamePlayCache } from "../../cache";
import { NUMERICAL } from "../../constants";
import Logger from "../../logger"
import { seatsInterface } from "../../interfaces/signup";
import { DefaultBaseTable } from "../../interfaces/tableGamePlay";
import { tableQueue } from "../../interfaces/tableConfig";


async function getAvailableTable(
    key: string,
    maximumSeat: number,
    tableID: string,
  ): Promise<string> {
    try {    
      Logger.info(tableID," maximumSeat ==>> ", maximumSeat);
      
      let tableId = '';
      let fetchTableId = '';
      const defaultTableGamePlay: DefaultBaseTable | null = { seats: [], tableState: '' };
      let tableGamePlay: DefaultBaseTable | null = defaultTableGamePlay;
      let seats: seatsInterface[] = tableGamePlay.seats;
      
      let getTableQueueArr: tableQueue = await tableConfigCache.getTableFromQueue(key);
      Logger.info(tableID,'getTableQueueArr  BEFORE:::>> ', getTableQueueArr);

      if(getTableQueueArr) {  
        fetchTableId = getTableQueueArr.tableId.splice(NUMERICAL.ZERO, NUMERICAL.ONE)[0];  
      } 
      Logger.info(tableID,'getTableQueueArr  AFTER:::>> ', getTableQueueArr);
      await tableConfigCache.setTableFromQueue(key, getTableQueueArr);
      if (fetchTableId) {
        tableGamePlay = await tableGamePlayCache.getTableGamePlay(fetchTableId);
        tableGamePlay = tableGamePlay || defaultTableGamePlay;
        seats = tableGamePlay.seats.filter(
          (ele: seatsInterface): string => ele.userId
        );
        if(seats.length < maximumSeat){
          tableId = fetchTableId
          Logger.info(tableID,'tableId =::=>> ', tableId);
        }
      }
      return tableId;
    } catch (error: any) {
      Logger.error(tableID,'getAvailableTable error', error);
      throw new Error(
        error && error.message && typeof error.message === 'string'
          ? error.message
          : 'getAvailableTable error'
      );
    }
  }

  export = getAvailableTable


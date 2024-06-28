import userProfileCache from './userProfile';
import tableConfigCache from './tableConfig';
import tableGamePlayCache from './tableGamePlay';
import playerGamePlayCache from './playerGamePlay';
import turnHistoryCache from "./turnHistory";
import lastDealCache from "./lastDeal";


const exportedObject = {
  userProfileCache,
  tableConfigCache,
  tableGamePlayCache,
  playerGamePlayCache,
  turnHistoryCache,
  lastDealCache
};

export = exportedObject;
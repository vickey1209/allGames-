import UserProfileService from './userProfile/model';
import TableGamePlayService from './tableGamePlay/model';
import TableConfigService from './tableConfig/model';
import PlayerGamePlayService from './playerGamePlay/model';



const exportObj = {
  UserProfile: new UserProfileService(),
  TableGamePlay: new TableGamePlayService(),
  TableConfig: new TableConfigService(),
  PlayerGamePlay: new PlayerGamePlayService(),
};

export = exportObj;
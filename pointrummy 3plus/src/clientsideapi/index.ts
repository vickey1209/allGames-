import { verifyUserProfile } from './verifyUserProfile';
import { getUserOwnProfile } from './getUserOwnProfile';
import { wallateDebit } from './walletDebit'
import { multiPlayerWinnScore } from './multiPlayerWinnScore'
import { gameSettinghelp } from './gameSettingMenuHelp'
import { checkBalance } from "./checkBalance";
import { getOneRobot } from "./getOneRobot";
import { rediusCheck } from "./rediusCheck";
import { firstTimeIntrection } from "./firstTimeIntrection";
import { markCompletedGameStatus } from "./markCompletedGameStatus";
import { checkUserBlockStatus } from "./checkUserBlockStatus";
import { checkMaintanence } from "./checkMaintanence";
import { addGameRunningStatus } from "./addGameRunningStatus";
import { multiPlayerDeductEntryFee } from "./multiPlayerDeductEntryFee";



let exportedObj = {
  verifyUserProfile,
  getUserOwnProfile,
  wallateDebit,
  multiPlayerWinnScore,
  gameSettinghelp,
  checkBalance,
  getOneRobot,
  rediusCheck,
  firstTimeIntrection,
  markCompletedGameStatus,
  checkUserBlockStatus,
  checkMaintanence,
  addGameRunningStatus,
  multiPlayerDeductEntryFee
};

export = exportedObj;

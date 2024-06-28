import { defaulPlayerGamePlayInterface } from '../../interfaces/playerGamePlay';
import { CreateTableI } from '../../interfaces/signup';
import { defaultTableConfig } from '../../interfaces/tableConfig';
import { defaultTableGamePlayInterface } from '../../interfaces/tableGamePlay';
import { UserProfileOutput } from '../../interfaces/userProfile';
import Logger from "../../logger"
import { findOrCreateTable } from '../playTable/findTable';
import insertPlayerInTable from './insertPlayerInTable';

const findTableForUser = async (
  data: CreateTableI,
  userProfile: UserProfileOutput
): Promise<{
  tableConfig: defaultTableConfig;
  tableGamePlay: defaultTableGamePlayInterface;
  playerGamePlay: defaulPlayerGamePlayInterface;
}> => {
  const tableId = await findOrCreateTable(data);
  try {
    Logger.info(tableId,`Starting findTableForUser for userid : ${userProfile.id}`);
    Logger.info(tableId,`Table with tableId : ${tableId} found or created for userid : ${userProfile.id}`);
   
    const insertPlayerRes = await insertPlayerInTable(userProfile, tableId);
    if (!insertPlayerRes) throw Error('Unable to insert player in table');

    const playerGamePlay = insertPlayerRes?.playerGamePlay;
    const tableGamePlay = insertPlayerRes?.tableGamePlay;
    const tableConfig = insertPlayerRes?.tableConfig;

    Logger.info(tableId,`Ending findTableForUser for userid : ${userProfile.id}`);
    return { tableConfig, tableGamePlay, playerGamePlay };

  } catch (error: any) {
    Logger.error(tableId,error, `function findTableForUser`);
    throw new Error(
      error && error.message && typeof error.message === 'string'
        ? error.message
        : 'function findTableForUser'
    );
  }
};

export = findTableForUser;
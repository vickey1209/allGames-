import { helpMenuRulsInput } from '../interfaces/inputOutputDataFormator';
import Logger from '../logger';
import settingMenuHelp from '../services/gameSettingMenuHelp';

async function showSettingMenuHelpInfoHelper(data:helpMenuRulsInput, socket: any ) {

    try {
        return await settingMenuHelp(data, socket)
    } catch (error) {
        Logger.error('CATCH_ERROR:  showSettingMenuHelpInfoHelper :: ', error);
    }
}

export = showSettingMenuHelpInfoHelper;
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../../../cache";
import { formateUpdatedGameTableData, formatRejoinTableData } from "../../../formatResponseData";
import { NewGTIResponse } from "../../../interfaces/tableConfig";
import { UserProfileOutput } from "../../../interfaces/userProfile";
import Logger from "../../../logger";

async function formatingSignUpResData(userId: string, isRejoinCall: boolean = false) {

    try {
        const userProfileData = await userProfileCache.getUserProfile(userId) as UserProfileOutput;
        Logger.info(userId,"userProfileData :: ", userProfileData, "userProfileData.tableIds.length ::>> ", userProfileData.tableIds.length);
        const gameTableInfoData = <NewGTIResponse[]>[];
        const currentGameTableInfoData = <NewGTIResponse[]>[];
        for (let i = 0; i < userProfileData.tableIds.length; i++) {
            const table_id = userProfileData.tableIds[i];

            const [tableGamePlayData, tableConfigData, playerGamePlayData] = await Promise.all([
                tableGamePlayCache.getTableGamePlay(table_id),
                tableConfigCache.getTableConfig(table_id),
                playerGamePlayCache.getPlayerGamePlay(userId, table_id)
            ]);

            if (!tableGamePlayData || !tableConfigData || !playerGamePlayData) {
                Logger.info(userId,`++++++++++++++++++++++++++++++++++++++++++ Could not find table and user data +++++++++++++++++++++++++++++++++++++++++++++++++++++++++>>`);
                continue;
            }

            let formatedGTIResponse: NewGTIResponse;
            if (isRejoinCall) {
                formatedGTIResponse =
                    await formatRejoinTableData(tableConfigData, tableGamePlayData, playerGamePlayData);
            }
            else {
                formatedGTIResponse = await formateUpdatedGameTableData(
                    tableConfigData,
                    tableGamePlayData,
                    playerGamePlayData,
                );
            }
            gameTableInfoData.push(formatedGTIResponse);
            if (userProfileData.tableId == table_id) {
                currentGameTableInfoData.push(formatedGTIResponse);
            }
        }
        Logger.info(userId,"gameTableInfoData ============>> ", gameTableInfoData);
        Logger.info(userId,"currentGameTableInfoData ============>> ", currentGameTableInfoData);

        return { gameTableInfoData, currentGameTableInfoData };

    } catch (error: any) {
        Logger.error(userId,"formatingSignUpResData :: ERROR :: >>", error);
        throw error;
    }
}

export = formatingSignUpResData;
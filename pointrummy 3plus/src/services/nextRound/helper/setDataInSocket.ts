import { getUserProfile, setUserProfile } from "../../../cache/userProfile";
import { NUMERICAL } from "../../../constants";
import { UserProfileOutput } from "../../../interfaces/userProfile";
import Logger from "../../../logger";
import { addClientInRoom, leaveClientInRoom } from "../../../socket";


async function setDataInSocket(
    oldTableId: string,
    newTableId: string,
    userIds: string[]
) {
    try {
        let counts = NUMERICAL.ZERO;
        for await (const userId of userIds) {
            const userProfile = await getUserProfile(userId) as UserProfileOutput;
            await addClientInRoom(userProfile.socketId, newTableId, userId)
            await leaveClientInRoom(userProfile.socketId, oldTableId)
            counts += NUMERICAL.ONE;
        }

        if (counts === userIds.length) {
            return true;
        }

    } catch (error) {
        Logger.error("  setDataInSocket :: ERROR ::>>  ", error);
        throw error;
    }
}

export = setDataInSocket;
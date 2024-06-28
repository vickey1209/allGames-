import { userProfileCache } from '../cache';
import { GetUserInput, UserProfileOutput } from '../interfaces/userProfile';

async function getUser(obj: GetUserInput): Promise<UserProfileOutput | null> {
  try {
    const userProfileData = await userProfileCache.getUserProfile(obj._id);
    if (userProfileData) return userProfileData;

    if (userProfileData)
      await userProfileCache.setUserProfile(obj._id, userProfileData);

    return userProfileData as UserProfileOutput | null;
  } catch (error: any) {
    userProfileCache.deleteUserProfile(obj._id);
    // don't have tableId
    throw new Error(error);
  }
}

const exportedObject = { getUser };
export = exportedObject;

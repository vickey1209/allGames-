import { findOrCreateUser } from '../signUp';
import Logger from "../../logger";
import { findUserI } from '../../interfaces/signup';
import { UserProfileDataInput, UserProfileOutput } from '../../interfaces/userProfile';
import userProfileUpdate from '../../clientsideapi/helper/userProfileUpdate';

const createOrFindUser = async (
  formatedSignupData: findUserI,
)=> {
  const userId = formatedSignupData.userId;
  try {  
    const updatedSignupData : UserProfileDataInput = await userProfileUpdate(formatedSignupData, formatedSignupData.socketId);
    const userProfile : UserProfileOutput = await findOrCreateUser(updatedSignupData);
    return {
      userProfile,
      signUpData: formatedSignupData
    };
  } catch (err: any) {
    Logger.error(userId,'lastUserData error', err);
    throw err;
  }
};

export = createOrFindUser;
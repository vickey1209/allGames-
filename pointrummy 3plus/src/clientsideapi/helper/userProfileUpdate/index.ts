import Logger from "../../../logger";
import { getUserOwnProfile } from "../../getUserOwnProfile";
import { findUserI } from "../../../interfaces/signup";
import { NUMERICAL } from "../../../constants";


async function userProfileUpdate(userDetail: findUserI, socketId: string):Promise<any>{
    const userId = userDetail.userId;
    try {
        const userOwnProfile = await getUserOwnProfile(userDetail.authToken, socketId, userId);
        Logger.info(userId,"userOwnProfile  :: >> ", userOwnProfile);
        Logger.info(userId,"userDetail  :: >> ", userDetail, "Number(userDetail.latitude) :: >> ", Number(userDetail.latitude), "Number(userDetail.longitude) :: ", Number(userDetail.longitude));

        // latitude, longitude, balance set in user profile
        let latitude : string = `${NUMERICAL.ZERO}`;
        let longitude : string = `${NUMERICAL.ZERO}`;

        if(Number(userDetail.latitude) == NUMERICAL.ZERO && Number(userDetail.longitude) == NUMERICAL.ZERO){
            latitude = userOwnProfile.latitude || "0.0";
            longitude = userOwnProfile.longitude || "0.0";
        }
        else{
            latitude = userDetail.latitude;
            longitude = userDetail.longitude;
        }
        const balance : number = userOwnProfile.winCash + userOwnProfile.cash || 0;

        let updateUserQuery = {
            ...userDetail,
            latitude: latitude,
            longitude: longitude,
            balance: balance
        }

        Logger.info(userId,'updateUserQuery :>>> ', updateUserQuery);
        return updateUserQuery;

    } catch (error : any) {
        Logger.error(userId,"CATCH_ERROR :userSignUp :: ", userDetail, error);
        throw error;
    }

}

export = userProfileUpdate;
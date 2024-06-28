const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");

import { getConfig } from "../../../config";
const { SECRET_KEY } = getConfig();

async function auth(authKey: string):Promise<any> {
    try {
        // const secretKey = "Artoon@123"
        console.log('authKey :>> ', authKey, "SECRET_KEY :: ", SECRET_KEY);
        let bytes = CryptoJS.AES.decrypt(authKey, SECRET_KEY);
        let gameId = bytes.toString(CryptoJS.enc.Utf8);
        console.log('gameId ::>> ', gameId);
      
        if(!gameId) {
            const resObj = {
                status: 400,
                message: "oops ! Something want wrong",
                data: null
            }
            return resObj;
        }else {
            const resObj = {
                status: 200,
                message: "data fetched",
                data: gameId
            }
            return resObj
        }
    } catch (error) {
        console.log('auth :>> ', error);
    }
};

export = auth
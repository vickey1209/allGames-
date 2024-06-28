// import s3BucketServices from "./s3BucketServices";
// import Logger from '../logger';
// import { seatsInterface } from "../interfaces/signup";


// async function addLogsInS3Bucket(tableId: string, seats: seatsInterface[]) {

//     try {
//         Logger.info(tableId, "starting Adding logs in S3 bucket");
//         //table details added
//         await s3BucketServices(tableId);

//         //users details added
//         for (let i = 0; i < seats.length; i++) {
//             const element = seats[i];
//             await s3BucketServices(element.userId);
//         }

//     } catch (error: any) {
//         Logger.error(tableId, `Error addLogsInS3Bucket() ERROR : ${error}`);
//     }

// }

// export = addLogsInS3Bucket;
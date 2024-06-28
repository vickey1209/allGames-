// import AWS from 'aws-sdk'
// import { getConfig } from "../config";
// const { BUCKET_NAME, REGION, AWS_ACCESS_KEY, AWS_SECRECT_KEY, LOGS_SAVE_DAYS } = getConfig();
// import Logger from '../logger';


// async function logsManage() {
//     try {

//         const s3 = new AWS.S3({
//             accessKeyId: AWS_ACCESS_KEY,
//             secretAccessKey: AWS_SECRECT_KEY,
//             region : REGION,
//         })
    
//          // Create the parameters for calling listObjects
//          var bucketParams = {
//             Bucket: BUCKET_NAME,
//         };
    
//         // Call S3 to obtain a list of the objects in the bucket
//         s3.listObjects(bucketParams, function (err : any, data : any) {
//             if (err) {
//                 Logger.info("Error", err);
//             } else {
//                 Logger.info("Success", data.Contents, data.Contents.length);
    
//                 const days = LOGS_SAVE_DAYS; 
//                 const last = new Date(new Date().getTime() - (days * 24 * 60 * 60 * 1000));
//                 let day = last.toISOString();
    
//                 let deleteRecords = data.Contents.filter((ele :any) => { return new Date(ele.LastModified) < new Date(day) });
//                 Logger.info('deleteRecord :>> ', deleteRecords, deleteRecords.length);
    
//                 for (let i = 0; i < deleteRecords.length; i++) {
//                     const ele = deleteRecords[i];
    
//                     const params = { Bucket:BUCKET_NAME, Key: ele.Key };
//                     s3.deleteObject(params, function (err, data) {
//                         if (err) Logger.info(err, err.stack);  
//                         else Logger.info("delete Data : SCCESS");          
//                     });
//                 }
//             }
//         });
        
//     } catch (error : any) {
//         Logger.error("logsManage() :: Error", error);   
//     }  
// }

// export = logsManage
// const fs = require("fs");
// import Logger from '../logger';
// import AWS from 'aws-sdk'
// import { getConfig } from "../config";
// const { BUCKET_NAME, REGION, AWS_ACCESS_KEY, AWS_SECRECT_KEY }  = getConfig();

// async function s3BucketServices(filename:string) {

//     try {
        
//         const s3 = new AWS.S3({
//             accessKeyId: AWS_ACCESS_KEY,
//             secretAccessKey: AWS_SECRECT_KEY,
//             region : REGION,
//         })

//         const fileContent = fs.readFileSync(`./logs/${filename}.txt`);
//         const params = {
//             Bucket: BUCKET_NAME,
//             Key: `${filename}.txt`,
//             Body: fileContent
//         }
    
//         s3.upload(params, (err: any, data: any) => {
//             if (err) {throw err;}
//             else{
//                 Logger.info('logs addd SUCCESS data :>> ', JSON.stringify(data));
//                 fs.unlinkSync(`./logs/${filename}.txt`, function(err: any, data: any){
//                     if (err) {throw err;}
//                 });
//                 Logger.info('File has been Deleted'); 
//             }         
//         })
        
//     } catch (error : any) {
//         Logger.error(`Error s3BucketServices() ERROR : ${error}`);
//     }
    
// }

// export = s3BucketServices;
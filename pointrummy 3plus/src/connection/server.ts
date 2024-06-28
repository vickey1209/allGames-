import * as http from 'http';
import { getConfig } from "../config";
const { HTTPS_KEY, HTTPS_CERT } = getConfig();

import path from 'path';
const fs = require("graceful-fs");
const https = require("https")
const express = require("express");
import bodyParser from 'body-parser'
// const cron = require('node-cron');
// import { cronJob } from '../services/PlayingTracking/helper';
import router from '../route';

const app = express();
// parse application/x-www-form-urlencoded
app.use(
    bodyParser.urlencoded({
        limit: '50mb',
        extended: false,
        parameterLimit: 1000000
    })
);

// parse application/json
app.use(bodyParser.json({ limit: '50mb' }));
app.use(router);

// view will be rendered using ejs
// app.use((req: any, res: any, next: any) => {
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');
// })   

// cron job at every 12 am 
// cron.schedule('0 0 * * *', async () => {
//     console.log('running cron job schedule every 12Am');
//     await cronJob();
// });

// setTimeout(async () => {
//     await cronJob();
// }, 2500)


/** health check */
app.get("/", (req: any, res: any) => {
    res.send("OK");
});

app.get("/health", (req: any, res: any) => {
    res.json("123");
});

app.get("/test", (req: any, res: any) => {
    res.json("OK");
});

let httpserver: any;
if (
    fs.existsSync(path.join(__dirname, HTTPS_KEY)) &&
    fs.existsSync(path.join(__dirname, HTTPS_CERT))
) {
    // creating https secure socket server
    let options = {
        key: fs.readFileSync(path.join(__dirname, HTTPS_KEY)),
        cert: fs.readFileSync(path.join(__dirname, HTTPS_CERT)),
    };
    console.log('creating https app');
    httpserver = https.createServer(options, app);
} else {
    // creating http server
    console.log('creating http app');
    httpserver = http.createServer(app);
}

// export default { serverConnect : connect }
export default { serverConnect: httpserver }


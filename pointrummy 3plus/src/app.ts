require("dotenv").config();
import { SOCKET } from "./constants";
import redis from "./connection/redis";
import socket from "./connection/socket";
import server from './connection/server';
import Logger from './logger';
import global from "./global";
import Lock from './lock';
import config from "./config";

(async () => {
    try {
        const { getConfig } = config;
        global.getConfigData = getConfig();
        console.log('getConfig() ::>> ', getConfig());
        /** server connection (http or https) */
        const secureServer = await server.serverConnect;

        /** redis and socket connection */
        const socketConfig = {
            transports: [SOCKET.WEBSOCKET, SOCKET.POLLING],
            allowEIO3: true,
            'pingTimeout': 180000,
            'pingInterval': 5000
        };
        const io = require("socket.io")(secureServer, socketConfig);
        const promise = await Promise.all([
            await redis.redisconnect(),
            await socket.socketconnect(io),
            // await mongo.init(),
        ]);
        const { client: redisClient }: any = promise[0];
        require('./commonEventHandlers/socket');
        Lock.init(redisClient);

        const isLoganable = true;
        global.isLoganable = isLoganable;

        const { getConfigData: { HTTP_SERVER_PORT } } = global;
        const port = HTTP_SERVER_PORT || 1000;
        secureServer.listen(port, function(){Logger.info(`<<== Listening on PORT : ${port} ==>>`)} );

    } catch (error) {
        Logger.error(`Server listen error :::=>`, error);
    }

})();


process
    .on('unhandledRejection', (reason: any, p: any) => {
        Logger.error(
            reason,
            'Unhandled Rejection at Promise >> ',
            new Date(),
            ' >> ',
            p
        );
    })
    .on('uncaughtException', (err) => {
        Logger.error('Uncaught Exception thrown', new Date(), ' >> ', '\n', err);
    });


import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import path from 'path';
import express from 'express';


/**
 * Import your Room files
 */
import { LobbyRoom } from 'colyseus';
import { WaitingRoom_2 } from "./rooms/WaitingRoom_2";
import { WaitingRoom_4 } from "./rooms/WaitingRoom_4";
import { GaigelRoom } from "./rooms/GaigelRoom";


export default Arena({
    getId: () => "Your Colyseus App",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer
            .define("lobby", LobbyRoom);
        gameServer
            .define("waitingRoom_2", WaitingRoom_2)
            .enableRealtimeListing();
        gameServer
            .define("waitingRoom_4", WaitingRoom_4)
            .enableRealtimeListing();
        gameServer
            .define("my_room", GaigelRoom)
            .enableRealtimeListing();
        gameServer
            .onShutdown(function(){
                console.log(`game server is going down.`);
            });

    },

    initializeExpress: (app) => {
        
        app.use('/', express.static(path.join(__dirname, "static")));
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use('/colyseus', monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
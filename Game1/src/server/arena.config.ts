import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import path from 'path';

import express from 'express';


/**
 * Import your Room files
 */
import { LobbyRoom } from 'colyseus';
import { GaigelRoom } from "./rooms/GaigelRoom";
import { ChatRoom } from "./rooms/01-chat-room";


export default Arena({
    getId: () => "Your Colyseus App",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer
            .define("lobby", LobbyRoom);
        gameServer
            .define("my_room", GaigelRoom)
            .enableRealtimeListing();

        gameServer.define("chat", ChatRoom)
            .enableRealtimeListing();

        // Register ChatRoom with initial options, as "chat_with_options"
        // onInit(options) will receive client join options + options registered here.
        gameServer.define("chat_with_options", ChatRoom, {
            custom_options: "you can use me on Room#onCreate"
        });

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
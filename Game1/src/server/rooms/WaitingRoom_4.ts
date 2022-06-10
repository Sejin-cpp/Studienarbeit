import { Room, Client } from "colyseus";

export class WaitingRoom_4 extends Room {
    // this room supports only 2 clients connected
    maxClients = 4;
    

    onCreate (options: any) {
        console.log("WaitingRoom_4 created!", options);

        this.onMessage("message", (client, message) => {
            console.log("WaitingRoom_4 received message from", client.sessionId, ":", message);
            this.broadcast("messages", `(${client.sessionId}) ${message}`);
        });

        this.onMessage("gameRoomId", (client, message) => {
            console.log("WaitingRoom_4 received message from", client.sessionId, ":", message);
            this.broadcast("gameRoomIdForOthers", `${message}`,{except: client});
        });

    }

    onJoin (client: Client) {
        this.broadcast("messages", `${ client.sessionId } joined. ${ this.clients.length }/4`,{except: client});
        client.send("messages", `You joined. ${ this.clients.length }/4`)
        this.broadcast("roomId", `${ this.roomId }`);

        if(this.clients.length == 4)
        {
            this.clients[0].send("joinRoom", `${this.clients[0].sessionId}`);
        }
    }

    onLeave (client: Client) {
        this.broadcast("messages", `${ client.sessionId } left.`);
    }

    onDispose () {
        console.log("Dispose WaitingRoom_4");
    }

}

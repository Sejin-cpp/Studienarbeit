import { Room, Client } from "colyseus";

export class WaitingRoom_2 extends Room {
    // this room supports only 2 clients connected
    maxClients = 2;
    

    onCreate (options: any) {
        console.log("WaitingRoom_2 created!", options);
        
        this.onMessage("message", (client, message) => {
            console.log("WaitingRoom_2 received message from", client.sessionId, ":", message);
            this.broadcast("messages", `(${client.sessionId}) ${message}`);
        });

        this.onMessage("gameRoomId", (client, message) => {
            console.log("WaitingRoom_2 received message from", client.sessionId, ":", message);
            this.broadcast("gameRoomIdForOthers", `${message}`,{except: client});
        });

    }

    onJoin (client: Client) {
        
        this.broadcast("messages", `${ client.sessionId } joined.`,{except: client});
        client.send("messages", `You joined.`)
        this.broadcast("roomId", `${ this.roomId }`);

        if(this.clients.length == 2)
        {
            this.clients[0].send("joinRoom", `${this.clients[0].sessionId}`);
            //this.broadcast("joinRoom", `${this.clients[0].sessionId}`,{except: this.clients[1]});
        }
               
    }

    onLeave (client: Client) {
        this.broadcast("messages", `${ client.sessionId } left.`);
    }

    onDispose () {
        console.log("Dispose WaitingRoom_2");
    }

}

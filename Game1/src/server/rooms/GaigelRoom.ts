import { Room, Client, updateLobby, Delayed } from "colyseus"
import { GaigelState } from "./schema/GaigelState"


export class GaigelRoom extends Room<GaigelState> {
  maxClients = 4;
  

  onCreate (options: any) {
    this.setState(new GaigelState());

    this.onMessage("keydown", (client, message) => {
      this.broadcast('keydown', message, {
          except: client
      })
    });



    updateLobby(this);
  }

  onJoin (client: Client, options: any) {
    
    console.log(client.sessionId, "joined!");
    
  }

  async onLeave (client: Client) {
    console.log(client.sessionId, "left!");
    try {

      // allow disconnected client to reconnect into this room until 1 seconds
      await this.allowReconnection(client, 0.2);
    } catch (e) {
    }
         
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
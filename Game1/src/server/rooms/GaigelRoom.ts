import { Room, Client, updateLobby } from "colyseus"
import { GaigelState } from "./schema/GaigelState"

export class GaigelRoom extends Room<GaigelState> {

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

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
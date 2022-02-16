import { Room, Client } from "colyseus"
import { GaigelState } from "./schema/GaigelState"
import {ClientMessage} from '../../types/ClientMessage'

export class GaigelRoom extends Room<GaigelState> {

  onCreate (options: any) {
    this.setState(new GaigelState())

    this.onMessage("keydown", (client, message) => {
      this.broadcast('keydown', message, {
          except: client
      })
    });

    this.onMessage(ClientMessage.CardMove, (client, message) => {
      console.log("Received")
      console.log(client.sessionId)
        this.broadcast(ClientMessage.CardMove,message, {
          except: client
      })
    });

  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!")
    this.state.addPlayer(client.sessionId)
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!")
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...")
  }

}
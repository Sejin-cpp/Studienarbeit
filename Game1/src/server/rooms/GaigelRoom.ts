import { Room, Client } from "colyseus"
import { GaigelState } from "./schema/GaigelState"
import {ClientMessage} from '../../types/ClientMessage'

export class GaigelRoom extends Room<GaigelState> {
  private clientCount = 0;
  private setCards = false;
  onCreate (options: any) {
    this.setState(new GaigelState())

    this.onMessage("keydown", (client, message) => {
      this.broadcast('keydown', message, {
          except: client
      })
    });

    this.onMessage(ClientMessage.CardMove, (client, message) => {
        this.broadcast(ClientMessage.CardMove,message, {
          except: client
      })
    });

    this.onMessage(ClientMessage.CardFlip, (client, message) => {
      this.broadcast(ClientMessage.CardFlip,message, {
        except: client
      })
    });

    this.onMessage(ClientMessage.CardDropOwnZone, (client, message) => {
      console.log(message)
      this.state.addCardToPlayer(client.sessionId,message.id)
      this.broadcast(ClientMessage.CardDropOwnZone,message, {
        except: client
      })
    });

    this.onMessage(ClientMessage.CardDropStichZone, (client, message) => {
      console.log(message)
      this.state.addCardToStich(client.sessionId,message.id)
      this.broadcast(ClientMessage.CardDropStichZone,message, {
        except: client
      })
    });

    this.onMessage(ClientMessage.CardUpdate, (client, message) => {
      //console.log(message)
      this.broadcast(ClientMessage.CardUpdate,message, {
        except: client
      })
    });

  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!")
    this.state.addPlayer(client.sessionId)
    this.clientCount++;
    if(this.setCards == false){
      this.state.setCardsInDeck();
      this.setCards = true;
    }
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!")
    this.clientCount--;
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...")
  }

}
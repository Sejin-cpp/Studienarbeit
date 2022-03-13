import { Room, Client } from "colyseus"
import { GaigelState } from "./schema/GaigelState"
import {ClientMessage} from '../../types/ClientMessage'

export class GaigelRoom extends Room<GaigelState> {
  private clientCount = 0;
  private setCards = false;
  private turnCounter = 0;
  onCreate (options: any) {
    this.setState(new GaigelState())

    //synchronisiere die Trumpffarbe mit den restlichen Clients
    this.onMessage(ClientMessage.updateTrumpfColor, (client, message) => {
      this.state.setTrumpfColor(message.color);
      this.broadcast(ClientMessage.updateTrumpfColor,message, {
        except: client
    })
  });

    //falls eine Karte bewegt wird, sendet der Server eine Nachricht an alle anderen Clients, um den Standort zu synchronisieren
    this.onMessage(ClientMessage.CardMove, (client, message) => {
        this.broadcast(ClientMessage.CardMove,message, {
          except: client
      })
    });
    //falls eine Karte geflippt wird, sendet der Server eine Nachricht an alle anderen Clients, um den Kartenflip zu synchronisieren
    this.onMessage(ClientMessage.CardFlip, (client, message) => {
      this.state.flipCard(client.sessionId,message.id);
      this.broadcast(ClientMessage.CardFlip,message, {
        except: client
      })
    });

    this.onMessage(ClientMessage.CardDropOwnZone, (client, message) => {
      this.state.addCardToPlayer(client.sessionId,message.id)
      this.broadcast(ClientMessage.CardDropOwnZone,message, {
        except: client
      })
    });

    this.onMessage(ClientMessage.CardDropStichZone, (client, message) => {
      //console.log(message)
      var info = this.state.addCardToStich(client.sessionId,message.id);
      if(info != "NO"){
        if(info != "OK"){
          this.broadcast(ClientMessage.firstTurn,info);
        }
        this.broadcast(ClientMessage.CardDropStichZone,message, {
          except: client
        })
        client.send(ClientMessage.EndTurn);
        if(this.turnCounter+1 == this.clientCount){
          this.turnCounter = 0;
        }
        else{
          this.turnCounter++;
        }
        if(this.state.countCardInStich == this.clients.length){
          var zaehler = 0;
          var winner = this.state.calculateWinnerOfStich();
          this.clients.forEach(tempclient => {
            if(tempclient.sessionId == winner.Id){
              this.turnCounter = zaehler;
              console.log(winner.cards)
              tempclient.send(ClientMessage.winStich,{cards: winner.cards})
              tempclient.send(ClientMessage.YourTurn);
            }
            else{
              tempclient.send(ClientMessage.loseStich);
            }
            zaehler++;
          })
        }
        else{
          this.clients[this.turnCounter].send(ClientMessage.YourTurn);
        }
      }
      if(this.state.testIfEndGame()){
        
      }
    });

    this.onMessage(ClientMessage.CardUpdate, (client, message) => {
      //console.log(message)
      this.broadcast(ClientMessage.CardUpdate,message, {
        except: client
      })
    });

  }

  onJoin (client: Client, options: any) {
    
    this.state.addPlayer(client.sessionId,this.clientCount+1)
    this.clientCount++;
    if(this.setCards == false){
      this.state.setCardsInDeck();
      this.setCards = true;
    }
    client.send(ClientMessage.EndTurn)
    if(this.clientCount == 2){  //beim 1v1 startet das Spiel nachdem zwei Spieler gejoined sind
      this.turnCounter = Math.floor(Math.random() * 2);   //bestimmte zufällig das Spieler 1 oder Spieler 2 zuerst dran ist
      this.clients[this.turnCounter].send(ClientMessage.YourTurn);
      this.clients[0].send(ClientMessage.setTrumpfColor);
      this.clients[1].send(ClientMessage.UpdateDeckPosition);
    }
    console.log(client.sessionId, "joined!")
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.removePlayer(client.sessionId);
    this.clientCount--;
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...")
  }

}
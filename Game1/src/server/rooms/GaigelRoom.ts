import { Room, Client } from "colyseus"
import { GaigelState } from "./schema/GaigelState"
import {ClientMessage} from '../../types/ClientMessage'

export class GaigelRoom extends Room<GaigelState> {
  private clientCount = 0;
  private maxPlayer : number = 0;
  private setCards = false;
  private turnCounter = 0;
  private aufDisslePlayer! : Client;
  private team1 : Client[] = new Array<Client>();
  private team2 : Client[] = new Array<Client>();
  private gameIsRunning : boolean = false;
  onCreate (options: any) {
    this.setState(new GaigelState());
    console.log(options);
    this.maxPlayer = options.playerCount;
    //wenn der Eröffnungsspieler sich entscheidet auf Dissle zu spielen, wird dieser Spieler gespeichert
    this.onMessage(ClientMessage.AufDissle, (client, message) => {
      console.log("AufDissle");
      this.state.firstTurn = false;
      this.aufDisslePlayer = client;
      this.state.playerAufDissle(client.sessionId);
      client.send(ClientMessage.YourTurn);   
  });

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
      //überprüfe sobald eine Karte zu einer Spielerhand hinzugefügt wurde, ob ein Spieler auf Dissle spielt und 5 siebener auf der Hand hat
      if(this.state.aufDissle){
        if(this.state.testDissle()){
          var playerIndex = this.team1.findIndex((client) => client == this.aufDisslePlayer);   //überprüfe in welchem Team sich der auf Dissle Spieler befindet, dieses Team gewinnt dann
          if(playerIndex == -1){ 
            this.team2.forEach(client => {
              client.send(ClientMessage.youAreTheWinner);
            })
            this.team1.forEach(client => {
              client.send(ClientMessage.youAreTheLoser);
            })
          }
          else{
            this.team1.forEach(client => {
              client.send(ClientMessage.youAreTheWinner);
            })
            this.team2.forEach(client => {
              client.send(ClientMessage.youAreTheLoser);
            })
          }
        }
      }
      this.broadcast(ClientMessage.CardDropOwnZone,message, {
        except: client
      })
    });

    //dies wird ausgeführt, sobald ein Spieler eine Karte auf den akutellen Stich legt
    this.onMessage(ClientMessage.CardDropStichZone, (client, message) => {
      //console.log(message)
      var info = this.state.addCardToStich(client.sessionId,message.id);
      console.log(info);
      if(info != "NO"){
        if(info != "OK"){ //Falls es sich bei diesem Zug um eine Spieleröffnung handelt, wird die Art der Spieleröffnung an alle Spieler gesendet
          console.log(info);
          this.broadcast(ClientMessage.secondTurn,info);
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
        if(this.state.countCardInStich == this.clients.length){   //falls jeder Spieler eine Karte auf den Stich gelegt hat, wird der Gewinner ermittelt
          var zaehler = 0;
          var winner = this.state.calculateWinnerOfStich();
          //falls der Spieler, welcher auf Dissle geht, einen Stich gewonnen hat, verliert sein Team
          if(winner.status == "NoDissle"){
            var playerIndex = this.team1.findIndex((client) => client == this.aufDisslePlayer);   //überprüfe in welchem Team sich der auf Dissle Spieler befindet, dieses Team verliert dann
            if(playerIndex == -1){ 
              this.team1.forEach(client => {
                client.send(ClientMessage.youAreTheWinner);
              })
              this.team2.forEach(client => {
                client.send(ClientMessage.youAreTheLoser);
              })
              console.log("Team1 wins");
            }
            else{
              this.team2.forEach(client => {
                client.send(ClientMessage.youAreTheWinner);
              })
              this.team1.forEach(client => {
                client.send(ClientMessage.youAreTheLoser);
              })
              console.log("Team2 wins");
            }
            
          }
          else if(winner.status == "OK"){
            this.clients.forEach(tempclient => {
              if(tempclient.sessionId == winner.Id){
                this.turnCounter = zaehler;
                console.log(winner.cards)
                tempclient.send(ClientMessage.YourTurn,{first: true});                      //der Gewinner ist als nächstes dran
                tempclient.send(ClientMessage.winStich,{cards: winner.cards}) //der Gewinner wird informiert und erhält als Info die Karten welche er gewonnen hat                   
              }
              else{
                tempclient.send(ClientMessage.loseStich,{cards: winner.cards});
              }
              zaehler++;
            })
            //send updated Points to Clients
            
            this.team1.forEach(client => {
              client.send(ClientMessage.updatePoints,{points: winner.team1Points});
            })
            this.team2.forEach(client => {
              client.send(ClientMessage.updatePoints,{points: winner.team2Points});
            })
          }
        }
        else{
          this.clients[this.turnCounter].send(ClientMessage.YourTurn,{first: false});
        }
      }
      var endZug = this.state.testIfEndGame();
      if(endZug.endGame){       //teste ob das Spiel vorbei ist
        this.gameIsRunning = false;
        var teamNr = this.state.calculateWinner();    //ermittele das Team welches gewonnen hat und sende allen Spieler die Info, ob sie gewonnen oder verloren haben
        if(teamNr.WinnerTeam == 1){
          this.team1.forEach(client => {
            client.send(ClientMessage.youAreTheWinner);
          })
          this.team2.forEach(client => {
            client.send(ClientMessage.youAreTheLoser);
          })
        }
        else{
          this.team2.forEach(client => {
            client.send(ClientMessage.youAreTheWinner);
          })
          this.team1.forEach(client => {
            client.send(ClientMessage.youAreTheLoser);
          })
        }
    
      }
      else if(endZug.farbZwang){
        this.broadcast(ClientMessage.farbZwang,message);
      }
    });

    this.onMessage(ClientMessage.CardUpdate, (client, message) => {
      //console.log(message)
      this.broadcast(ClientMessage.CardUpdate,message, {
        except: client
      })
    });

    this.onMessage(ClientMessage.stealTrumpf, (client, message) => {
      //console.log(message)
      this.state.raubTrumpf(client.sessionId,message.newTrumpf,message.oldTrumpf);
      this.broadcast(ClientMessage.stealTrumpf,message, {
        except: client
      })
    });

    this.onMessage(ClientMessage.melden, (client, message) => {
      //console.log(message)
      this.state.melden(client.sessionId,message.cards);
      this.broadcast(ClientMessage.melden,message, {
        except: client
      })
    });

  }

  onJoin (client: Client, options: any) {
    this.clientCount++;
    if(this.setCards == false){
      this.state.setCardsInDeck();
      this.setCards = true;
    }
    client.send(ClientMessage.EndTurn)
    if(this.clientCount == this.maxPlayer){  //das Spiel startet, sobald die Anzahl der Clients der maximal Spieleranzahl entspricht
      this.gameIsRunning = true;
      this.turnCounter = Math.floor(Math.random() * this.maxPlayer);   //bestimmte zufällig welcher Spieler zuerst dran ist
      this.clients[this.turnCounter].send(ClientMessage.YourTurn, {first: true});
      this.clients[this.turnCounter].send(ClientMessage.startTurn);
      if(this.clientCount == 2){
        this.state.addPlayer(this.clients[0].sessionId,1);
        this.state.addPlayer(this.clients[1].sessionId,2);
        this.team1.push(this.clients[0]);
        this.team2.push(this.clients[1]);
        this.team1[0].send(ClientMessage.setPos,{pos: 1});
        this.team2[0].send(ClientMessage.setPos,{pos: 2});
        this.team2[0].send(ClientMessage.UpdateDeckPosition);
      }
      else if (this.clientCount == 4){
        var teamNr = 1;
        for(var i = 0; i < this.clientCount; i++){
          this.clients[i].send(ClientMessage.setPos,{pos: i+1});
          this.state.addPlayer(this.clients[i].sessionId,teamNr);
          teamNr += 1;
          if(teamNr > 2){
            teamNr = 1;
            this.team2.push(this.clients[i]);
          }
          else{
            this.team1.push(this.clients[i]);
          }
        }
        this.clients[2].send(ClientMessage.UpdateDeckPosition);
        this.clients[3].send(ClientMessage.UpdateDeckPosition);
      }
      this.clients[this.turnCounter].send(ClientMessage.setTrumpfColor);             //setze Trumpffarbe
    }
    console.log(client.sessionId, "joined!")
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    var clientIndex = this.team1.findIndex((clientT) => clientT == client);
    if(clientIndex == -1){
      this.team2.splice(clientIndex,1);
    }
    else{
      this.team1.splice(clientIndex,1);
    }
    this.state.removePlayer(client.sessionId);
    this.clientCount--;
    if(this.gameIsRunning){                         //falls ein Spieler das laufende Spiel verlässt, verliert sein Team
      this.gameIsRunning = false;
      if(clientIndex == -1){ 
        this.team1.forEach(clientT => {
          clientT.send(ClientMessage.youAreTheWinner);
        })
        this.team2.forEach(clientT => {
          clientT.send(ClientMessage.youAreTheLoser);
        })
        console.log("Team1 wins");
      }
      else{
        this.team2.forEach(clientT => {
          clientT.send(ClientMessage.youAreTheWinner);
        })
        this.team1.forEach(clientT => {
          clientT.send(ClientMessage.youAreTheLoser);
        })
        console.log("Team2 wins");
      }
    }
    
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...")
  }

}
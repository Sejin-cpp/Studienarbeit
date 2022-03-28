import { Schema, type, ArraySchema } from '@colyseus/schema'
import CardDraggable from '../../../gameObjects/CardDraggable'
import {FirstStich} from '../../../types/firstStich'


class CardState extends Schema
{
  @type('number')
  id : number

  @type('string')
  color : string

  @type('string')
  symbol : string

  @type('number')
  value : number

  @type('boolean')
  hidden : boolean
  constructor(id :number, color: string, symbol: string, value: number)
  {
    super()
    this.id = id
    this.color = color
    this.symbol = symbol
    this.value = value
    this.hidden = true;
  }

  getValue(){
    return this.value;
  }

  flip(){
    if(this.hidden){
      this.hidden = false;
    }
    else{
      this.hidden = true;
    }
  }
}

class PlayerState extends Schema 
{
  @type('string')
  id : string  

  @type('number')
  team : number  

  @type('number')
  turnOrder : number 
  
  @type([CardState])
  cardsInHand: CardState[]

  @type([CardState])
  cardsWon: CardState[]

  @type(CardState)
  cardInStich!: CardState


  constructor(id : string, team: number)
  {
    super()
    this.id = id
    this.cardsInHand = new ArraySchema <CardState>()
    this.cardsWon = new ArraySchema <CardState>()
    this.team = team
    this.cardInStich = new CardState(0,"x","x",0);
    this.turnOrder = 0;
  }
  addCardInHand(card: CardState){
    this.cardsInHand.push(card)
  }

  addCardToStich(card: CardState){
    this.cardInStich = card;
  }

  addCardWon(card: CardState){
    this.cardsWon.push(card)
  }

  removeCardFromHand(cardIndex: number){
    this.cardsInHand.splice(cardIndex,1);
  }

  removeCardFromStich(){
    this.cardInStich = new CardState(0,"x","x",0);
  }
}

export class GaigelState extends Schema 
{
  @type('boolean')
  firstTurn : boolean

  @type([PlayerState])
  playerstates: PlayerState[]

  @type(PlayerState)
  firstPlayerinFirstTurn!: PlayerState

  @type([PlayerState])
  possibleWinners: PlayerState[]

  @type([CardState])
  cardsInDeck: CardState[]

  @type('number')
  countCardInStich : number

  @type('number')
  turnOrder : number = 1

  @type('number')
  teams : number[] = [0,0];

  @type('string')
  trumpfColor! : string

  @type('string')
  firstStich : string

  @type('boolean')
  aufDissle : boolean

  constructor()
  {
    super()

    this.playerstates = new ArraySchema<PlayerState>();
    this.possibleWinners = new ArraySchema<PlayerState>();
    this.cardsInDeck = new  ArraySchema <CardState>();
    this.countCardInStich = 0;
    this.firstTurn = true;
    this.firstStich = "";
    this.aufDissle = false;
  }
  addPlayer(id : string, team : number)
  {
    this.playerstates.push(new PlayerState(id, team))
    console.log(team)
  }
  removePlayer(id: string){
    var playerIndex = this.playerstates.findIndex((playerstate) => playerstate.id == id);
    this.playerstates.splice(playerIndex,1);
  }
  setCardsInDeck()
  {
      this.cardsInDeck.push(new CardState(1,"eichel","sieben",0))
      this.cardsInDeck.push(new CardState(2,"eichel","zehn",10))
      this.cardsInDeck.push(new CardState(3,"eichel","unter",2))
      this.cardsInDeck.push(new CardState(4,"eichel","ober",3))
      this.cardsInDeck.push(new CardState(5,"eichel","koenig",4))
      this.cardsInDeck.push(new CardState(6,"eichel","ass",11))
      this.cardsInDeck.push(new CardState(7,"eichel","sieben",0))
      this.cardsInDeck.push(new CardState(8,"eichel","zehn",10))
      this.cardsInDeck.push(new CardState(9,"eichel","unter",2))
      this.cardsInDeck.push(new CardState(10,"eichel","ober",3))
      this.cardsInDeck.push(new CardState(11,"eichel","koenig",4))
      this.cardsInDeck.push(new CardState(12,"eichel","ass",11))

      this.cardsInDeck.push(new CardState(13,"blatt","sieben",0))
      this.cardsInDeck.push(new CardState(14,"blatt","zehn",10))
      this.cardsInDeck.push(new CardState(15,"blatt","unter",2))
      this.cardsInDeck.push(new CardState(16,"blatt","ober",3))
      this.cardsInDeck.push(new CardState(17,"blatt","koenig",4))
      this.cardsInDeck.push(new CardState(18,"blatt","ass",11))
      this.cardsInDeck.push(new CardState(19,"blatt","sieben",0))
      this.cardsInDeck.push(new CardState(20,"blatt","zehn",10))
      this.cardsInDeck.push(new CardState(21,"blatt","unter",2))
      this.cardsInDeck.push(new CardState(22,"blatt","ober",3))
      this.cardsInDeck.push(new CardState(23,"blatt","koenig",4))
      this.cardsInDeck.push(new CardState(24,"blatt","ass",11))
      

      this.cardsInDeck.push(new CardState(25,"herz","sieben",0))
      this.cardsInDeck.push(new CardState(26,"herz","zehn",10))
      this.cardsInDeck.push(new CardState(27,"herz","unter",2))
      this.cardsInDeck.push(new CardState(28,"herz","ober",3))
      this.cardsInDeck.push(new CardState(29,"herz","koenig",4))
      this.cardsInDeck.push(new CardState(30,"herz","ass",11))
      this.cardsInDeck.push(new CardState(31,"herz","sieben",0))
      this.cardsInDeck.push(new CardState(32,"herz","zehn",10))
      this.cardsInDeck.push(new CardState(33,"herz","unter",2))
      this.cardsInDeck.push(new CardState(34,"herz","ober",3))
      this.cardsInDeck.push(new CardState(35,"herz","koenig",4))
      this.cardsInDeck.push(new CardState(36,"herz","ass",11))
      

      this.cardsInDeck.push(new CardState(37,"schellen","sieben",0))
      this.cardsInDeck.push(new CardState(38,"schellen","zehn",10))
      this.cardsInDeck.push(new CardState(39,"schellen","unter",2))
      this.cardsInDeck.push(new CardState(40,"schellen","ober",3))
      this.cardsInDeck.push(new CardState(41,"schellen","koenig",4))
      this.cardsInDeck.push(new CardState(42,"schellen","ass",11))
      this.cardsInDeck.push(new CardState(43,"schellen","sieben",0))
      this.cardsInDeck.push(new CardState(44,"schellen","zehn",10))
      this.cardsInDeck.push(new CardState(45,"schellen","unter",2))
      this.cardsInDeck.push(new CardState(46,"schellen","ober",3))
      this.cardsInDeck.push(new CardState(47,"schellen","koenig",4))
      this.cardsInDeck.push(new CardState(48,"schellen","ass",11))
  }
  setTrumpfColor(color : string){
    this.trumpfColor = color;
  }
  //wenn die Karte umgedreht wird, wird dessen Status im Server aktualisiert
  flipCard(playerid: string, cardid: number){
    var playerIndex = this.playerstates.findIndex((playerstate) => playerstate.id == playerid);
    var cardIndex =this.playerstates[playerIndex].cardsInHand.findIndex((cardstate) => cardstate.id == cardid);
    if(cardIndex == -1){                             //falls die Karte sich nicht in der Hand des Spielers befindet, wird die Karte nicht umgedreht
      return false;
    }
    else{
      this.playerstates[playerIndex].cardsInHand[cardIndex].flip();
    }
  }

  //diese Methode fügt die Karte mit der übergebenen KartenID zu der Hand des Spielers mit der übergebenen SpielerID hinzu
  addCardToPlayer(playerid :string,cardid : number){
    var playerIndex = this.playerstates.findIndex((playerstate) => playerstate.id == playerid);
    var cardIndex =this.playerstates[playerIndex].cardsInHand.findIndex((cardstate) => cardstate.id == cardid);
    if(cardIndex == -1){                             //falls die Karte sich nicht in der Hand des Spielers befindet, wird die Karte zur Spielerhand zugefügt und aus dem Deck gelöscht
      cardIndex = this.cardsInDeck.findIndex((cardstate) => cardstate.id == cardid);
      this.playerstates[playerIndex].addCardInHand(this.cardsInDeck[cardIndex]);
      this.cardsInDeck.splice(cardIndex,1);
    }
    else{  //falls die Karte sich bereits in der Hands befindet, passiert nichts
      return
    }
  }
  //diese Methode wird bei einem Raub ausgeführt und fügt die geraubte Karte der Hand des Spielers hinzu.
  raubTrumpf(playerid :string,newtrumpfcardid : number, oldtrumpfcardid : number){
    var playerIndex = this.playerstates.findIndex((playerstate) => playerstate.id == playerid);
    var newtrumpfcardIndex = this.cardsInDeck.findIndex((cardstate) => cardstate.id == newtrumpfcardid);
    var oldtrumpfcardIndex = this.playerstates[playerIndex].cardsInHand.findIndex((cardstate) => cardstate.id == oldtrumpfcardid);  //suche die Karte aus der Spielerhand heraus
    this.playerstates[playerIndex].removeCardFromHand(oldtrumpfcardIndex);
    this.playerstates[playerIndex].addCardInHand(this.cardsInDeck[newtrumpfcardIndex]);
  }

  //diese Methode wird bei einem Melden ausgeführt und fügt 20 oder 40m Punkte zum Team hinzu.
  melden(playerid :string, cardIds : number[]){
    var playerIndex = this.playerstates.findIndex((playerstate) => playerstate.id == playerid);
    var teamNr = this.playerstates[playerIndex].team - 1;
    var value = 0;
    var cardIndex = this.playerstates[playerIndex].cardsInHand.findIndex((cardstate) => cardstate.id == cardIds[0]);  //suche die erste Karte aus der Spielerhand heraus
    var card : CardState = this.playerstates[playerIndex].cardsInHand[cardIndex];
    if(card.color == this.trumpfColor){   //hat das gemeldete Paar die Trumpffarbe, so erhält der Spieler 40 Punkte, ansonsten 20
      value = 40;
    }
    else{
      value = 20;
    }
    if(cardIds.length == 4){    //falls er zweimal das selbe Paar besitzt, bekommt der Spieler doppelte Punkte
      value *= 2;
    }
    this.teams[teamNr] += value;  //füge die Punkte hinzu
  }

  //diese Methode speichert den Spieler, welcher auf Dissle geht und vermerkt dass in diesem Spiel ein Spieler auf Dissle geht
  playerAufDissle(playerid :string){  
    var playerIndex = this.playerstates.findIndex((playerstate) => playerstate.id == playerid);
    this.aufDissle = true;
    this.firstPlayerinFirstTurn = this.playerstates[playerIndex];
  }

  testDissle(){
    var zaehler = 0;
    this.firstPlayerinFirstTurn.cardsInHand.forEach(card => {
      if(card.value == 0){
        zaehler++;
      }
    })
    if(zaehler == 5){
      return true;
    }
    return false;
  }

  //diese Methode fügt eine Karte dem aktuellen Stich hinzu und entfernt die Karte aus der Hand des Spielers, welcher sie gelegt hat
  addCardToStich(playerid :string,cardid : number){
    var playerIndex = this.playerstates.findIndex((playerstate) => playerstate.id == playerid);
    if(this.playerstates[playerIndex].cardInStich.id == 0){                                                      //falls noch keine Karte von diesem Spieler sich im Stich befindet, wird diese dem Stich hinzugefügt
      var cardIndex = this.playerstates[playerIndex].cardsInHand.findIndex((cardstate) => cardstate.id == cardid);  //suche die Karte aus der Spielerhand heraus
      this.playerstates[playerIndex].addCardToStich(this.playerstates[playerIndex].cardsInHand[cardIndex]);
      this.playerstates[playerIndex].removeCardFromHand(cardIndex);                                           //entferne die Karte aus der Spielerklasse
      this.playerstates[playerIndex].turnOrder = this.turnOrder;                                              //speichere ab, wann der Spieler dran war
      this.turnOrder++;
      this.countCardInStich++;                                                                                //aktualisiere die akutelle Anzahl der Karten im aktuellen Stich
      if(this.countCardInStich == 1 && this.firstTurn){     //beim ersten Stich und bei der ersten Karte, wird je nach K  arte die Art der Spieleröffnung bestimmt
        var tempCard : CardState = this.playerstates[playerIndex].cardInStich;  
        this.firstPlayerinFirstTurn = this.playerstates[playerIndex];   //speichere den ersten Spieler
        if(tempCard.symbol == "ass" && tempCard.hidden){   //Andere Alte
          this.firstStich = "AndereAlte";
        } 
        if(tempCard.symbol == "ass" && !tempCard.hidden){   //Ge-Elfen
          this.firstStich = "Ge-Elfen";
        }
        if(tempCard.symbol != "ass" && tempCard.hidden){   //Höher Hat
          this.firstStich = "HöherHat";
        }
        console.log(this.firstStich);
        return this.firstStich;
      }
      return "OK";
    }
    else{             //falls bereits eine Karte von diesem Spieler im aktuellen Stich ist, passiert nichts
      return "NO";
    }
  }

  calculateWinnerOfStich(){
    this.turnOrder = 1;
    this.possibleWinners = new ArraySchema<PlayerState>();
    var winner! : PlayerState;
    var tempValue = -1;
    var cardIDs : number[] = [0];
    // bei einem Eröffnungsspiel hängt der Sieger davon ab, welche Karte als Erstes geworfen wurde
    if(this.firstTurn){
      this.firstTurn = false;
      winner = this.firstPlayerinFirstTurn;
      switch(this.firstStich){
        case "AndereAlte":
          this.playerstates.forEach(player => {
            if(player != this.firstPlayerinFirstTurn){
              //falls ein Spieler dasselbe Ass gelegt hat wie der Eröffnungsspieler, gweinnt er den Stich
              if(player.cardInStich.color == this.firstPlayerinFirstTurn.cardInStich.color && player.cardInStich.symbol == this.firstPlayerinFirstTurn.cardInStich.symbol){
                winner = player;
              }
            }
          })
          break; 
        case "Ge-Elfen":
          //der Eröffnungsspieler gewinnt in jedem Fall den Stich
          break; 
        case "HöherHat":
          this.playerstates.forEach(player => {
            if(player != this.firstPlayerinFirstTurn){
              //es gewinnt der Spieler mit der Karte, welche dieselbe Farbe wie die Eröffnungskarte besitzt und den höchsten Wert besitzt
              if(player.cardInStich.color == this.firstPlayerinFirstTurn.cardInStich.color && player.cardInStich.value > this.firstPlayerinFirstTurn.cardInStich.value){
                this.firstPlayerinFirstTurn = player;
              }
            }
          })
          winner = this.firstPlayerinFirstTurn;
          break; 
        default:
      }
    }
    //Ansonsten gewinnt der Spieler mit der höchsten Karte. Bei Trumpffarben gewinnt der Spieler mit der höchsten Karte mit Trumpffarbe
    else{
      if(this.lookForTrumpfColor() == false){
        this.possibleWinners = this.playerstates;
      }
      this.possibleWinners.forEach(player => {
        if(tempValue < player.cardInStich.value){
          tempValue= player.cardInStich.value;
          winner = player;
        }
        else if(tempValue == player.cardInStich.value){
          if(winner.turnOrder > player.turnOrder){      //bei Karten mit gleichem Wert gewinnt der Spieler, welcher früher eine Karte gelegt hat
            tempValue= player.cardInStich.value;
            winner = player;
          }
        }
      })
    }
    console.log("Der Stich wurde gewonnen von:");
    console.log(winner.id);
    if(this.aufDissle){   //falls auf Dissle gespielt wird und dieser Spieler einen Stich gewonnen hat, verliert sein Team das Spiel
      if(winner == this.firstPlayerinFirstTurn){
        return {status: "NoDissle"}
      }
    }
    //füge den gewonnen Stich zum Gewinner hinzu und setzte den Stich zurück
    var i = 0;
    this.playerstates.forEach(player => {
      winner.addCardWon(player.cardInStich)
      cardIDs[i] = player.cardInStich.id;
      this.teams[winner.team-1] += player.cardInStich.value;    //addiere die Punkte zum Team des Spielers
      player.removeCardFromStich();
      i++;
    })
    this.countCardInStich = 0;
    return {Id: winner.id, cards: cardIDs, status: "OK"};
  
    
  }

  lookForTrumpfColor(){
    var trumpfFound = false;
    this.playerstates.forEach(player => {
      if (player.cardInStich.color == this.trumpfColor){
        this.possibleWinners.push(player)
        trumpfFound = true;
      }
    })
    return trumpfFound;
  }

  testIfEndGame(){
    var endeGame = false;
    if (this.cardsInDeck.length == 0){
      endeGame = true;
    }
    this.teams.forEach(teamPoints => {
      if(teamPoints >= 101){
        endeGame = true;
      }
    })
    return endeGame;
  }

  calculateWinner(){
    var winnerTeam = 0;
    var tempValue = 0;
    var zaehler = 1;
    this.teams.forEach(team => {
      if(team > tempValue){
        winnerTeam = zaehler;
        tempValue = team;
      }
      zaehler++;
    })
    return {WinnerTeam: winnerTeam}
  }

  
  
}
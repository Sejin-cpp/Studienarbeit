import { Schema, type, ArraySchema } from '@colyseus/schema'
import CardDraggable from '../../../gameObjects/CardDraggable'


class CardState extends Schema
{
  @type('number')
  id : number

  @type('string')
  farbe : string

  @type('string')
  art : string

  @type('number')
  value : number
  constructor(id :number, farbe: string, art: string, value: number)
  {
    super()
    this.id = id
    this.farbe = farbe
    this.art = art
    this.value = value
  }

  getValue(){
    return this.value;
  }
}

class PlayerState extends Schema 
{
  @type('string')
  id : string  

  @type('number')
  team : number  
  
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
   
  }
}

export class GaigelState extends Schema 
{

  @type([PlayerState])
  playerstates: PlayerState[]

  @type([CardState])
  cardsInDeck: CardState[]

  @type('number')
  countCardInStich : number

  constructor()
  {
    super()

    this.playerstates = new ArraySchema<PlayerState>();
    this.cardsInDeck = new  ArraySchema <CardState>();
    this.countCardInStich = 0;
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
  //diese Methode fügt die Karte mit der übergebenen KartenID zu der Hand des Spielers mit der übergebenen SpielerID hinzu
  addCardToPlayer(playerid :string,cardid : number){
    var playerIndex = this.playerstates.findIndex((playerstate) => playerstate.id == playerid);
    var cardIndex =this.playerstates[playerIndex].cardsInHand.findIndex((cardstate) => cardstate.id == cardid);
    if(cardIndex == -1){                             //falls die Karte sich nicht in der Hand des Spielers befindet, wird die Karte zur Spielerhadn zugefügt und aus dem Deck gelöscht
      cardIndex = this.cardsInDeck.findIndex((cardstate) => cardstate.id == cardid);
      this.playerstates[playerIndex].addCardInHand(this.cardsInDeck[cardIndex]);
      this.cardsInDeck.splice(cardIndex,1);
    }
    else{  //falls die Karte sich bereits in der Hands befindet, passiert nichts
      return
    }
  }
  //diese Methode fügt eine Karte dem aktuellen Stich hinzu und entfernt die Karte aus der Hand des Spielers, welcher sie gelegt hat
  addCardToStich(playerid :string,cardid : number){
    var playerIndex = this.playerstates.findIndex((playerstate) => playerstate.id == playerid);
    if(this.playerstates[playerIndex].cardInStich == null){                                                      //falls noch keine Karte von diesem Spieler sich im Stich befindet, wird diese dem Stich hinzugefügt
      var cardIndex = this.playerstates[playerIndex].cardsInHand.findIndex((cardstate) => cardstate.id == cardid);  //suche die Karte aus der Spielerhadn heraus
      this.playerstates[playerIndex].addCardToStich(this.playerstates[playerIndex].cardsInHand[cardIndex]);
      this.playerstates[playerIndex].removeCardFromHand(cardIndex);
      this.countCardInStich++;
      if(this.countCardInStich == this.playerstates.length){
        this.calculateWinner();
      }
    }
    else{             //falls bereits eine Karte von diesem Spieler im aktuellen Stich ist, passiert nichts
      return
    }
  }

  calculateWinner(){
    var team1Value = this.calculatePointsForTeam(1);
    var team2Value = this.calculatePointsForTeam(2);
 
    if(team1Value > team2Value){
      console.log("Team1 gewinnt den Stich");
    }
    else if (team1Value < team2Value){
      console.log("Team2 gewinnt den Stich");
    }
  }

  calculatePointsForTeam(teamNr : number){
    var value : number = 0;
    this.playerstates.forEach(player => {
      if (player.team == teamNr){
        value += player.cardInStich.value;
      }
    })
    return value;
  }
}
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
  wert : number
  constructor(id :number, farbe: string, art: string, wert: number)
  {
    super()
    this.id = id
    this.farbe = farbe
    this.art = art
    this.wert = wert
  }
}

class PlayerState extends Schema 
{
  @type('string')
  id : string  
  
  @type([CardState])
  cardsInHand: CardState[]

  @type([CardState])
  cardsWon: CardState[]
  constructor(id : string)
  {
    super()
    this.id = id
    this.cardsInHand = new ArraySchema <CardState>()
    this.cardsWon = new ArraySchema <CardState>()
  }
  addCardInHand(card: CardState){
    this.cardsInHand.push(card)
  }

  addCardWon(card: CardState){
    this.cardsWon.push(card)
  }

  removeCardFromHand(){

  }
}

export class GaigelState extends Schema 
{

  @type([PlayerState])
  playerstates: PlayerState[]

  @type([CardState])
  cardsInDeck: CardState[]

  @type([CardState])
  cardsInStich: CardState[]
  constructor()
  {
    super()

    this.playerstates = new ArraySchema<PlayerState>();
    this.cardsInDeck = new  ArraySchema <CardState>();
    this.cardsInStich = new  ArraySchema <CardState>();
  }
  addPlayer(id : string)
  {
    this.playerstates.push(new PlayerState(id))
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
     if(cardIndex == -1){ //falls die Karte sich nicht in der Hand des Spielers befindet, wird die Karte zur Spielerhadn zugefügt und aus dem Deck gelöscht
      cardIndex = this.cardsInDeck.findIndex((cardstate) => cardstate.id == cardid);
      this.playerstates[playerIndex].addCardInHand(this.cardsInDeck[cardIndex]);
      this.cardsInDeck.splice(cardIndex,1);
     }
     else{  //falls die Karte sich bereits in der Hand des Spielers befindet, passiert nichts
       return
     }
  }

  removeCardFromPlayerHand(id : string){
    
  }
}
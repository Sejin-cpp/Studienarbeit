import { Schema, type, ArraySchema } from '@colyseus/schema'
import CardDraggable from '../../../gameObjects/CardDraggable'


/*class CardState extends Schema
{
  @type('string')
  farbe : string

  @type('string')
  art : string

  constructor(farbe: string, art: string)
  {
    super()
    this.farbe = farbe
    this.art = art
  }
}
*/
class PlayerState extends Schema 
{
  @type('string')
  id : string  
  
  cardsInHand: CardDraggable[]

  cardsWon: CardDraggable[]
  constructor(id : string)
  {
    super()
    this.id = id
    this.cardsInHand = new Array <CardDraggable>()
    this.cardsWon = new Array <CardDraggable>()
  }
  addCardInHand(card: CardDraggable){
    this.cardsInHand.push(card)
  }

  addCardWon(card: CardDraggable){
    this.cardsWon.push(card)
  }

  removeCardFromHand(){

  }
}

export class GaigelState extends Schema 
{

  @type([PlayerState])
  playerstates: PlayerState[]

  cardsInDeck: CardDraggable[]

  constructor()
  {
    super()

    this.playerstates = new ArraySchema<PlayerState>()
    this.cardsInDeck = new  Array <CardDraggable>()
  }
  addPlayer(id : string)
  {
    this.playerstates.push(new PlayerState(id))
  }

  setCardsInDeck(cardsInDeck : CardDraggable[])
  {
    this.cardsInDeck = cardsInDeck
  }

}
import { Schema, type, ArraySchema } from '@colyseus/schema'

class CardState extends Schema
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

class PlayerState extends Schema 
{
  @type('string')
  id : string  
  
  @type([CardState])
  cardsInHand: CardState[]

  @type([CardState])
  cardsInStich: CardState[]
  constructor(id : string)
  {
    super()
    this.id = id
    this.cardsInHand = new ArraySchema<CardState>()
    this.cardsInStich = new ArraySchema<CardState>()
  }
}

export class GaigelState extends Schema 
{

  @type([PlayerState])
  playerstates: PlayerState[]
  constructor()
  {
    super()

    this.playerstates = new ArraySchema<PlayerState>()
  }
  addPlayer(id : string)
  {
    this.playerstates.push(new PlayerState(id))
  }

}
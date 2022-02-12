import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
import { GaigelState } from '~/server/rooms/schema/GaigelState'
import CardDraggable from '../../gameObjects/CardDraggable'
export default class GaigelMode1 extends Phaser.Scene
{
    private client!: Colyseus.Client
    private cards : CardDraggable[]
	constructor()
	{
		super('hello-world')
        this.cards = new Array<CardDraggable>()
	}

    init()
    {
        this.client = new Colyseus.Client('ws://localhost:2567')
    }

	preload()
    {
        this.load.image('eichel7','assets/eichel7.png')
        this.load.image('eichelAss','assets/eichel7.png')
        this.load.image('eichelKoenig','assets/eichel7.png')
        this.load.image('eichelOber','assets/eichel7.png')
        this.load.image('eichelUnter','assets/eichel7.png')
    }

    async create()
    {
       const room = await this.client.joinOrCreate<GaigelState>('my_room')

       console.log(room.sessionId)
       
       room.onStateChange(state => {
           console.dir(state)
       })
       this.cards.push(new CardDraggable({
        scene: this,
        name: 'HerzAss',
        x:200,
        y:200,
        card: 'card',
        depth: 1,
        ondragend: (pointer,gameObject) => {},
        width: 50,
        height: 100
       }))

       room.state.setCardsInDeck(this.cards)
        
       /*
       room.onMessage('keydown',(message) => {
           console.log(message)
       })
       this.input.keyboard.on('keydown',(evt : KeyboardEvent) =>{
           room.send('keydown',evt.key)
       })
       */
    }
}

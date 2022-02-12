import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
import { GaigelState } from '~/server/rooms/schema/GaigelState'
export default class GaigelMode1 extends Phaser.Scene
{
    private client!: Colyseus.Client

	constructor()
	{
		super('hello-world')
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

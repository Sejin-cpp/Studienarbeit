import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
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
        
    }

    async create()
    {
        try {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const roomID = urlParams.get('rID')  
            if(roomID == null)
            {
                location.href = "index.html"; 
            }
            else
            {
                const room = await this.client.joinById(roomID)
                console.log("joined successfully", room);
            }            
                   
          } catch (e) {
            console.error("join error", e);
          }
        /** 
       const room = await this.client.joinOrCreate('my_room')

       console.log(room.sessionId)
       
       room.onMessage('keydown',(message) => {
           console.log(message)
       })
       this.input.keyboard.on('keydown',(evt : KeyboardEvent) =>{
           room.send('keydown',evt.key)
       })
       */
    }
    
}
import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
export default class LobbyMode1 extends Phaser.Scene
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
       const lobby = await this.client.joinOrCreate('lobby')

       console.log(lobby.sessionId)

       let allRooms: Colyseus.RoomAvailable[] = [];

        lobby.onMessage("rooms", (rooms) => {
            allRooms = rooms;
        });
      
        lobby.onMessage("+", ([roomId, room]) => {
            const roomIndex = allRooms.findIndex((room) => room.roomId === roomId);
            if (roomIndex !== -1) {
            allRooms[roomIndex] = room;
      
            } else {
                allRooms.push(room);
            }
        });
      
        lobby.onMessage("-", (roomId) => {
            allRooms = allRooms.filter((room) => room.roomId !== roomId);
        });
       
        console.log(allRooms)
       
        this.client.getAvailableRooms("my_room").then(rooms => {
            rooms.forEach((room) => {
              console.log(room.roomId);
              console.log(room.clients);
              console.log(room.maxClients);
              console.log(room.metadata);
            });
          }).catch(e => {
            console.error(e);
          });

    }
    
}

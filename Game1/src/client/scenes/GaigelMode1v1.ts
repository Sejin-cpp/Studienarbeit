import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
import { GaigelState } from '../../server/rooms/schema/GaigelState'
import CardDraggable from '../../gameObjects/CardDraggable'
import StateMachine from '../../statemachine/StateMachine'
import {ClientMessage} from '../../types/ClientMessage'
import CardZone from '../../gameObjects/Cardzone'
import PlayerZone from '../../gameObjects/Playerzone'

export default class GaigelMode1v1 extends Phaser.Scene
{
    private client!: Colyseus.Client
    private cards : CardDraggable[]
    private stateMachine! : StateMachine
    private room!: Colyseus.Room<GaigelState>
    private tempCard!:  CardDraggable
    private cardx = 0;
    private cardy = 0;
    private gameWidth;
    private gameHeight;
    private centerX;
    private centerY;
    private differenz;
    private ownZone! : PlayerZone;
    private enemyZone! : PlayerZone;
    private stichZone! : CardZone;
    private stichSet : boolean = false;
	constructor()
	{
		super('hello-world')
        this.cards = new Array<CardDraggable>()
      
	}

    init()
    {
        this.client = new Colyseus.Client('ws://localhost:2567')
        this.stateMachine = new StateMachine(this, 'game')
        this.stateMachine.addState('idle')
            .addState('cardMove', {
                onEnter: this.cardMoveEnter,
                onUpdate: this.cardMoveUpdate
            })
            .setState('idle')
    }

	preload()
    {
        this.gameWidth = this.sys.game.canvas.width
        this.gameHeight = this.sys.game.canvas.height
        this.centerX = this.gameWidth/2;
        this.centerY = this.gameHeight/2;

        this.load.image('eichel7','assets/eichel7.png')
        this.load.image('eichel10','assets/eichel10.png')
        this.load.image('eichelAss','assets/eichelAss.png')
        this.load.image('eichelKoenig','assets/eichelKoenig.png')
        this.load.image('eichelOber','assets/eichelOber.png')
        this.load.image('eichelUnter','assets/eichelUnter.png')
        
        this.load.image('blatt7','assets/blatt7.png')
        this.load.image('blatt10','assets/blatt10.png')
        this.load.image('blattAss','assets/blattAss.png')
        this.load.image('blattKoenig','assets/blattKoenig.png')
        this.load.image('blattOber','assets/blattOber.png')
        this.load.image('blattUnter','assets/blattUnter.png')

        this.load.image('herz7','assets/herz7.png')
        this.load.image('herz10','assets/herz10.png')
        this.load.image('herzAss','assets/herzAss.png')
        this.load.image('herzKoenig','assets/herzKoenig.png')
        this.load.image('herzOber','assets/herzOber.png')
        this.load.image('herzUnter','assets/herzUnter.png')

        this.load.image('schellen7','assets/schellen7.png')
        this.load.image('schellen10','assets/schellen10.png')
        this.load.image('schellenAss','assets/schellenAss.png')
        this.load.image('schellenKoenig','assets/schellenKoenig.png')
        this.load.image('schellenOber','assets/schellenOber.png')
        this.load.image('schellenUnter','assets/schellenUnter.png')

        this.load.image('cardback','assets/cardback.png')
    }

    async create()
    {
       
       this.input.mouse.disableContextMenu();
       this.room = await this.client.joinOrCreate<GaigelState>('my_room')

       console.log(this.room.sessionId)

       //erstelle Kartendeck
       this.cardx = this.centerX+200;
       this.cardy = this.centerY;
       this.createCardObjects();
       var id = 1;
       this.cards.forEach(element => {
            element.setScale(0.7);
            element.on('pointerdown', (pointer,gameObject) =>{
                if (pointer.rightButtonDown() && element.onHand)
                {
                    this.room.send(ClientMessage.CardFlip,{id: element.id, onHand: element.onHand})
                    element.flip()
                }
            });
            element.id = id;
            id++;
        });
        Phaser.Actions.Shuffle(this.cards);
        var i = 1;
        this.cards.forEach(element =>{
            element.setDepth(i);
            i++;
        })
        //erstelle Kartenablagestellen
        this.enemyZone = new PlayerZone(this,this.centerX,125,750,250);
        this.ownZone = new PlayerZone(this,this.centerX,this.gameHeight-125,750,250);
        this.stichZone = new CardZone(this,this.centerX,this.centerY,150,250);
        
       this.room.onStateChange.once(state => { 
           console.dir(state)
           //this.room.state.setCardsInDeck(this.cards)
       }) 


       //----------Funktionen beim Ausführen einer Mausfunktion-----------------
       //beim Start eines drags einer Karte mit dem Mauszeiger, wird diese Funktion ausgeführt
       this.input.on('dragstart',(pointer,gameObject) =>{
            if(!gameObject.draggable) return;
            this.stateMachine.setState('cardMove');
            this.tempCard = gameObject;
            if(gameObject.onHand == true){  //wahr falls sich die Karte auf deiner Hand befand
                this.ownZone.removeCard(gameObject);    //entferne Karte aus deiner Hand
                this.ownZone.updateCardPosition();      //aktualisiere die neuen Positionen
                this.room.send(ClientMessage.CardUpdate, {card:this.tempCard, id:this.tempCard.id});    //sende eine Nachricht an den Server zur Synchronisierung des Kartenbildes mit allen anderen Spielern
                this.ownZone.cards.forEach(element => {
                    this.room.send(ClientMessage.CardMove, {card:element, id:element.id});              //sende eine Nachricht für jede Karte an, um die neuen Postionen der Karten auf der Hand zu synchronisieren
                });
                //gameObject.onHand = false;
            }
           
        })

        this.input.on('drag',(pointer,gameObject,dragX,dragY) =>{
            if(!gameObject.draggable) return;
            gameObject.dragging = true;
            gameObject.x = dragX;
            gameObject.y = dragY;

        })
        
        this.input.on('dragend',(pointer,gameObject, dropped) =>{
            if(!gameObject.draggable) return;
            if (!dropped)       //wird ausgeführt, wenn das gezogene Objekt nicht auf einer Zone abgelegt wurde
            {
                if(gameObject.onHand == false){
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                }
                else{                                                 //falls die Karte sich in der Hand befunden hat, kommt sie geordnet auf die Hand zurück
                    this.ownZone.addCard(gameObject);
                    this.ownZone.updateCardPosition();
                    gameObject.y = this.ownZone.dropZone.y;
                    this.room.send(ClientMessage.CardDropOwnZone, {id:this.tempCard.id});
                }
            }
            this.stateMachine.setState('idle');
            this.room.send(ClientMessage.CardMove, {card:this.tempCard, id:this.tempCard.id});

            
        })
        //Eigen gezogene Karten können nur auf dem Stich oder auf der eigenen Hand abgelegt werden
        this.input.on('drop', (pointer, gameObject, target) => {
            if(!gameObject.draggable) return;
            if(target == this.stichZone.dropZone){
                if(!this.stichSet){         //falls der Spieler bereits eine Karte auf dem Stich abgelegt hat, kommt die Karte auf die Hand zurück
                    gameObject.x = target.x;
                    gameObject.y = target.y;
                    gameObject.input.enabled = false;
                    gameObject.onHand = false;
                    this.stichSet = true;
                    this.room.send(ClientMessage.CardDropStichZone, {id:this.tempCard.id});    
                }
                else{
                    this.ownZone.addCard(gameObject);
                    this.ownZone.updateCardPosition();
                    gameObject.y = this.ownZone.dropZone.y;
                    this.room.send(ClientMessage.CardDropOwnZone, {id:this.tempCard.id});
                }
                 
            }
            else if(target == this.ownZone.dropZone){
                if(target.data.values.cards >= 5){
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                    return
                }
                this.ownZone.addCard(gameObject);
                this.ownZone.updateCardPosition();
                gameObject.y = target.y;
                gameObject.onHand = true;
                this.room.send(ClientMessage.CardDropOwnZone, {id:this.tempCard.id});
            }
        });


        //------------Funktionen welche beim eintreffen von Nachrichten vom Server ausgeführt werden-----------------
        //sobald ein anderer Spieler eine Karte bewegt, wird das Spielfeld dementsprechend aktualisiert
        this.room.onMessage(ClientMessage.CardMove,(message) =>{
            this.cards.forEach(element => {
                if(message.id == element.id){
                    if(message.card.x > this.centerX){
                        element.x = this.centerX -(message.card.x - this.centerX);
                    }
                    else{
                        element.x = this.centerX + (this.centerX - message.card.x)
                    }
                    if(message.card.y > this.centerY){
                        element.y = this.centerY - (message.card.y - this.centerY);
                    }
                    else{
                        element.y = this.centerY + (this.centerY - message.card.y)
                    }
                    
                }
           });
        })

        //Falls man Spieler 2 ist, muss die Position des Decks geändert werden
        this.room.onMessage(ClientMessage.UpdateDeckPosition,(message) =>{
            this.cards.forEach(element => {
                element.x = this.centerX-200;
            });
            
        })

        //Führe einen Kartenflip bei der Karte mit der in der Nachricht übergeben ID aus
        this.room.onMessage(ClientMessage.CardFlip,(message) =>{
            if(message.onHand == false){
                this.cards.forEach(element => {
                    if(message.id == element.id){
                        element.flip()
                    }
                });
            }
        })
        //Der Server schickt eine Nachricht, dass die Karte in die eines Mitspielers gelegt wurde. Verdecke diese Karte.
        this.room.onMessage(ClientMessage.CardDropOwnZone,(message) =>{
            this.cards.forEach(element => {
                if(message.id == element.id){
                    element.setTexture(element.cardback);
                    element.input.enabled = false;
                }
            });
        })
        //Der Server schickt eine Nachricht, dass eine Karte von einem Mitspieler aus seiner Hand bewegt wurde. Die Texture dieser Karte muss geupdatet werden(verdeckt oder nicht verdeckt).
        this.room.onMessage(ClientMessage.CardUpdate,(message) =>{
            this.cards.forEach(element => {
                if(message.id == element.id){
                    console.log(message.texture);
                    element.setTexture(message.card.textureKey);
                }
            });
        })
        //es ist dein Zug, du kannst Karten bewegen
        this.room.onMessage(ClientMessage.YourTurn,(message) =>{
            this.cards.forEach(element => {
                element.setDraggAble(true);
            })
        })
        //dein Zug ist zuende, du kannst keine Karten bewegen, aber du kannst Karten noch umdrehen
        this.room.onMessage(ClientMessage.EndTurn,(message) =>{
            this.cards.forEach(element => {
                element.setDraggAble(false);
            })
        })

        this.room.onMessage(ClientMessage.setTrumpfColor,(message) => {
            this.cards[0].x = this.centerX-200;
            this.cards[0].y = this.centerY;
            this.cards[0].setTexture(this.cards[0].cardname)
            this.cards[0].input.enabled = false;
            this.room.send(ClientMessage.updateTrumpfColor,{id:this.cards[0].id, color: this.cards[0].color})
        })

        this.room.onMessage(ClientMessage.updateTrumpfColor,(message) =>{
            this.cards.forEach(element => {
                if(element.id == message.id){
                    element.x = this.centerX+200;
                    element.y = this.centerY;
                    element.setTexture(element.cardname)
                    element.input.enabled = false;
                }
            })
        })

        this.room.onMessage(ClientMessage.winStich,(message) =>{
            message.cards.forEach(id => {
                this.cards.forEach(card => {
                    if(card.id == id){
                        card.depth = 1;
                        card.x = this.centerX-500
                        card.y = this.gameHeight-125
                        card.input.enabled = false;
                        this.room.send(ClientMessage.CardMove,{card:card, id:card.id})
                    }
                })     
            });
        })
    }
    

    private cardMoveEnter(){
        this.room.send(ClientMessage.CardMove,"StartDrag")
    }

    private cardMoveUpdate(){
        this.room.send(ClientMessage.CardMove, {card:this.tempCard, id:this.tempCard.id})
    }

    createCardObjects(){
        //Eichel Karten*2
        for (var i = 0; i < 2; i++){
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'eichel7',
                depth: 1,
                color : "eichel",
                symbol : "sieben",
                value : 0,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'eichel10',
                depth: 1,
                color : "eichel",
                symbol : "zehn",
                value : 10,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'eichelUnter',
                depth: 1,
                color : "eichel",
                symbol : "unter",
                value : 2,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'eichelOber',
                depth: 1,
                color : "eichel",
                symbol : "ober",
                value : 3,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'eichelKoenig',
                depth: 1,
                color : "eichel",
                symbol : "koenig",
                value : 4,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'eichelAss',
                depth: 1,
                color : "eichel",
                symbol : "ass",
                value : 11,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
        }

        //Blatt Karten*2
        for (var i = 0; i < 2; i++){
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'blatt7',
                depth: 1,
                color : "blatt",
                symbol : "sieben",
                value : 0,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'blatt10',
                depth: 1,
                color : "blatt",
                symbol : "zehn",
                value : 10,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'blattUnter',
                depth: 1,
                color : "blatt",
                symbol : "unter",
                value : 2,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'blattOber',
                depth: 1,
                color : "blatt",
                symbol : "ober",
                value : 3,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'blattKoenig',
                depth: 1,
                color : "blatt",
                symbol : "koenig",
                value : 4,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'blattAss',
                depth: 1,
                color : "blatt",
                symbol : "ass",
                value : 11,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
        }

        //Herz Karten*2
        for (var i = 0; i < 2; i++){
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'herz7',
                depth: 1,
                color : "herz",
                symbol : "sieben",
                value : 0,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'herz10',
                depth: 1,
                color : "herz",
                symbol : "zehn",
                value : 10,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'herzUnter',
                depth: 1,
                color : "herz",
                symbol : "unter",
                value : 2,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'herzOber',
                depth: 1,
                color : "herz",
                symbol : "ober",
                value : 3,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'herzKoenig',
                depth: 1,
                color : "herz",
                symbol : "koenig",
                value : 4,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'herzAss',
                depth: 1,
                color : "herz",
                symbol : "ass",
                value : 11,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
        }

        //Schellen Karten*2
        for (var i = 0; i < 2; i++){
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'schellen7',
                depth: 1,
                color : "schellen",
                symbol : "sieben",
                value : 0,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'schellen10',
                depth: 1,
                color : "schellen",
                symbol : "zehn",
                value : 10,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'schellenUnter',
                depth: 1,
                color : "schellen",
                symbol : "unter",
                value : 2,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'schellenOber',
                depth: 1,
                color : "schellen",
                symbol : "ober",
                value : 3,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'schellenKoenig',
                depth: 1,
                color : "schellen",
                symbol : "koenig",
                value : 4,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
            this.cards.push(new CardDraggable({
                scene: this,
                x:this.cardx,
                y:this.cardy,
                cardname: 'schellenAss',
                depth: 1,
                color : "schellen",
                symbol : "ass",
                value : 11,
                cardback: 'cardback',
                ondragend: (pointer,gameObject) => {},
                //width: 50,
                //height: 100
            }))
        }
    }

    update(t: number, dt: number)
    {
        this.stateMachine.update(dt)
        
    }
}

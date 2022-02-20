import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
import { GaigelState } from '../../server/rooms/schema/GaigelState'
import CardDraggable from '../../gameObjects/CardDraggable'
import StateMachine from '../../statemachine/StateMachine'
import {ClientMessage} from '../../types/ClientMessage'
import CardZone from '../../gameObjects/Cardzone'
import PlayerZone from '../../gameObjects/Playerzone'

export default class GaigelMode1 extends Phaser.Scene
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
       
      // this.input.mouse.disableContextMenu();
       this.room = await this.client.joinOrCreate<GaigelState>('my_room')

       console.log(this.room.sessionId)

       //erstelle Kartendeck
       this.cardx = this.centerX+200;
       this.cardy = this.centerY;
       this.createCardObjects();
       var id = 0;
       this.cards.forEach(element => {
        element.setScale(0.7);
        element.on('pointerdown', (pointer,gameObject) =>{
            if (pointer.rightButtonDown())
            {
                this.room.send(ClientMessage.CardFlip,{id: element.id})
                element.flip()
            }
        });
        element.id = id;
        id++;
        });
        //erstelle Kartenablagestellen
        this.enemyZone = new PlayerZone(this,this.centerX,125,750,250);
        this.ownZone = new PlayerZone(this,this.centerX,this.gameHeight-125,750,250);
        this.stichZone = new CardZone(this,this.centerX,this.centerY,150,250);
        
       this.room.onStateChange.once(state => { 
           console.dir(state)
           this.room.state.setCardsInDeck(this.cards)
       }) 


       //Funktionen beim Ausführen einer Mausfunktion
       this.input.on('dragstart',(pointer,gameObject) =>{
            this.stateMachine.setState('cardMove')
            this.tempCard = gameObject
        })

        this.input.on('drag',(pointer,gameObject,dragX,dragY) =>{
            if(!gameObject.draggable) return;
            gameObject.dragging = true;
            gameObject.x = dragX;
            gameObject.y = dragY;

        })
        
        this.input.on('dragend',(pointer,gameObject, dropped) =>{
            if (!dropped)
            {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
            this.stateMachine.setState('idle');
            this.room.send(ClientMessage.CardMove, {card:this.tempCard, id:this.tempCard.id});

            
        })
        //Eigen gezogene Karten können nur auf dem Stich oder auf der eigenen Hand abgelegt werden
        this.input.on('drop', (pointer, gameObject, target) => {
            if(target == this.stichZone.dropZone){
                gameObject.x = target.x;
                gameObject.y = target.y;
                gameObject.input.enabled = false;
            }
            else if(target == this.ownZone.dropZone){
                gameObject.x = (target.x - 300) + (target.data.values.cards * 150);
                target.data.values.cards++;
                gameObject.y = target.y;
            }
            else{
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });

        /*
        this.input.on('drop', function (pointer, gameObject, dropZone) {

            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;
    
            gameObject.input.enabled = false;
    
        });
        /*
            this.input.on('dragend', function (pointer, gameObject, dropped) {

            if (!dropped)
            {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }

                graphics.clear();
                graphics.lineStyle(2, 0xffff00);
                graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);

             });
        
        */

        //sobald ein anderer Spieler eine Karte bewegt, wird das Spielfeld dementsprechend aktualisiert
        this.room.onMessage(ClientMessage.CardMove,(message) =>{
            this.cards.forEach(element => {
                if(message.id == element.id){
                    if((message.card.x == this.cardx) && (message.card.y == this.cardy)){
                        element.x = message.card.x;
                        element.y = message.card.y;
                        return
                    }
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

        this.room.onMessage(ClientMessage.CardFlip,(message) =>{
            this.cards.forEach(element => {
                if(message.id == element.id){
                    element.flip()
                }
           });
        })
        
    }
    

    private cardMoveEnter(){
        console.log("drag")
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

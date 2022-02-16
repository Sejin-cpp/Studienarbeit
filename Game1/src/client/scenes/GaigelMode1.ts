import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
import { GaigelState } from '../../server/rooms/schema/GaigelState'
import CardDraggable from '../../gameObjects/CardDraggable'
import StateMachine from '../../statemachine/StateMachine'
import {ClientMessage} from '../../types/ClientMessage'


export default class GaigelMode1 extends Phaser.Scene
{
    private client!: Colyseus.Client
    private cards : CardDraggable[]
    private stateMachine! : StateMachine
    private room!: Colyseus.Room<GaigelState>
    private tempCard!:  CardDraggable
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
       //this.input.mouse.disableContextMenu();
       this.room = await this.client.joinOrCreate<GaigelState>('my_room')

       console.log(this.room.sessionId)
       
       this.room.onStateChange.once(state => {
           var id = 0;
           console.dir(state)
           this.createCardObjects();
           this.cards.forEach(element => {
                element.setScale(0.5);
                element.id = id;
                id++;
           });
           this.room.state.setCardsInDeck(this.cards)
       })
        
       /*
       room.onMessage('keydown',(message) => {
           console.log(message)
       })
       this.input.keyboard.on('keydown',(evt : KeyboardEvent) =>{
           room.send('keydown',evt.key)
       })
       */

       //Card Movement

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
        
        this.input.on('dragend',(pointer,gameObject) =>{
            this.stateMachine.setState('idle')
        })

        this.room.onMessage(ClientMessage.CardMove,(message) =>{
            console.log(message)
            this.cards.forEach(element => {
                if(message.id == element.id){
                    element.x = message.card.x
                    element.y = message.card.y
                }
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
        }

        //Blatt Karten*2
        for (var i = 0; i < 2; i++){
            this.cards.push(new CardDraggable({
                scene: this,
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
        }

        //Herz Karten*2
        for (var i = 0; i < 2; i++){
            this.cards.push(new CardDraggable({
                scene: this,
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
        }

        //Schellen Karten*2
        for (var i = 0; i < 2; i++){
            this.cards.push(new CardDraggable({
                scene: this,
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
                x:200,
                y:200,
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
        }
    }

    update(t: number, dt: number)
    {
        this.stateMachine.update(dt)
    }
}

import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
import { GaigelState } from '../../server/rooms/schema/GaigelState'
import CardDraggable from '../../gameObjects/CardDraggable'
import {ClientMessage} from '../../types/ClientMessage'
import CardZone from '../../gameObjects/CardZone'
import PlayerZone from '../../gameObjects/PlayerZone'
import Button from '../../gameObjects/Button'

export default class GaigelMode1v1 extends Phaser.Scene
{
    private client!: Colyseus.Client
    private cards : CardDraggable[]
    private room!: Colyseus.Room<GaigelState>
    private tempCard!:  CardDraggable
    private trumpfCard!:  CardDraggable
    private cardx = 0;
    private cardy = 0;
    private gameWidth;
    private gameHeight;
    private centerX;
    private centerY;
    private background! : Phaser.GameObjects.Sprite;
    private ownZone! : PlayerZone;
    private enemyZone! : PlayerZone;
    private stichZone! : CardZone;
    private stichSet : boolean = false;
    private fiveCardsInHand : boolean = false;
    private firstTurn : boolean = false;
    private text;
    private pointCounter;
    private pos! : number;
    private button! : Button;
    private eichelMeldenButton! : Button;
    private blattMeldenButton! : Button;
    private herzMeldenButton! : Button;
    private schellenMeldenButton! : Button;
    //Parameter für Melden
    private eichelGemeldet : boolean = false;
    private blattGemeldet : boolean = false;
    private herzGemeldet : boolean = false;
    private schellenGemeldet : boolean = false;
    private pairGemeldet : boolean = false;
    //Bei leeren Talon
    private farbZwang : boolean = false;
    private firstCard! : CardDraggable;
    private firstCardOnStich : boolean = false;
    private firstCardSet : boolean = false;    
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
        this.load.image('button','assets/button.png')

        this.load.image('background', 'assets/background.jpg');
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
                try{
                this.room = await this.client.joinById(roomID)
                console.log("joined successfully", this.room);
                }
                catch(e)
                {
                    window.location.reload();
                }
            }            
                   
        } catch (e) {
            console.error("join error", e);
        }

       this.input.mouse.disableContextMenu();
       //this.room = await this.client.joinOrCreate<GaigelState>('my_room');
       this.background = this.add.sprite(0,0,'background');
       this.background.scale = 2;
       this.background.depth = 0;
       console.log(this.room.sessionId)

       //erstelle Kartendeck
       this.cardx = this.centerX+200;
       this.cardy = this.centerY;
       this.createCardObjects();
       var id = 1;
       this.cards.forEach(element => {
            element.setScale(0.7);
            //legt für jede Karte eine Funktion an, welche besagt, dass bei einem Rechtsklick auf die Karte, diese mit der Methode flip() umgedreht wird. Eine Karte kann nicht umgedreht werden, wenn sie gemeldet wurde
            element.on('pointerdown', (pointer,gameObject) =>{
                if (pointer.rightButtonDown() && element.onHand && (element.gemeldet == false))
                {
                    element.input.enabled = false;
                    //this.room.send(ClientMessage.CardFlip,{id: element.id, onHand: element.onHand})
                    element.flip()
                    element.input.enabled = true;
                }
            });
            element.id = id;
            id++;
        });
        Phaser.Actions.Shuffle(this.cards); //Das Array, welches alle Karten enthält, wird gemischt
        var i = 2;
        this.cards.forEach(element =>{      //Reihenfolge wird festgelegt, Deck wird gemischt
            element.setDepth(i);
            i++;
        })
        //erstelle Kartenablagestelle

        this.stichZone = new CardZone(this,this.centerX,this.centerY,150,250,0xff69b4);
        
       this.room.onStateChange.once(state => { 
           console.dir(state)
       }) 


       //----------Funktionen beim Ausführen einer Mausfunktion-----------------
       //beim Start eines drags einer Karte mit dem Mauszeiger, wird diese Funktion ausgeführt
       this.input.on('dragstart',(pointer,gameObject) =>{
            if(!gameObject.draggable) return;
            //this.stateMachine.setState('cardMove');
            this.tempCard = gameObject;
            if(gameObject.onHand == true){  //wahr falls sich die Karte auf deiner Hand befand
                this.ownZone.removeCard(gameObject);    //entferne Karte aus deiner Hand
                this.ownZone.updateCardPosition();      //aktualisiere die neuen Positionen der Handkarten
                this.room.send(ClientMessage.CardUpdate, {card:this.tempCard, id:this.tempCard.id});    //sende eine Nachricht an den Server zur Synchronisierung des Kartenbildes mit allen anderen Spielern
                this.ownZone.cards.forEach(element => {
                    this.room.send(ClientMessage.CardMove, {card:element, id:element.id});              //sende eine Nachricht für jede Karte an, um die neuen Postionen der Karten auf der Hand zu synchronisieren
                });
                //gameObject.onHand = false;
            }
           
        })

        this.input.on('drag',(pointer,gameObject,dragX,dragY) =>{
            if(!gameObject.draggable) return;
            this.room.send(ClientMessage.CardMove, {card:this.tempCard, id:this.tempCard.id})
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
            this.room.send(ClientMessage.CardMove, {card:this.tempCard, id:this.tempCard.id});
            

            
        })
        //Eigen gezogene Karten können nur auf dem Stich oder auf der eigenen Hand abgelegt werden
        this.input.on('drop', (pointer, gameObject, target) => {
            if(!gameObject.draggable) return;
            //----------------------------Ablegen einer Karte auf Stichzone-----------------------------------------------------//
            if(target == this.stichZone.dropZone){
                var cardOnStichOk : boolean = true;
                if((this.pairGemeldet == false) && !this.stichSet && this.fiveCardsInHand && ( (!gameObject.hidden && !this.firstTurn) || (this.firstTurn && (gameObject.symbol == "ass" || gameObject.hidden) ) ) || ( this.pairGemeldet && gameObject.gemeldet)){         //falls der Spieler noch keine Karte auf dem Stich abgelegt hat und fünf Karten auf der Hand hat, kommt die Karte auf die Hand zurück. Es wird auch überprüft ob die Karte offen gelegt wird. Ausnahme ist der erste Zug, wo ein verdeckte Karten gelegen werden dürfen. Falls der Spieler ein Koenig-Ober Paar gemeldet hat, muss eines dieser Karten abgelegt werden
                    if(this.farbZwang && !this.firstCardOnStich){
                        if(this.ownZone.testForFarbZwang(this.firstCard.color) && (gameObject.color != this.firstCard.color)){          //falls der Spieler versucht eine Karte zu legen, welche eine andere Farbe als die der ersten Karte auf dem akutellen Stich besitzt. obwohl eine Karte derselben Farbe auf der Hand hat, wird dies nicht zugelassen
                            cardOnStichOk = false;
                        }
                    }
                }
                else{
                    cardOnStichOk = false;
                }
                if(cardOnStichOk){
                    if(this.button){
                        this.button.text.destroy();
                        this.button.destroy();
                    }
                    this.pairGemeldet = false;
                    gameObject.x = target.x;
                    gameObject.y = target.y;
                    gameObject.setDraggAble(false);
                    gameObject.onHand = false;
                    this.stichSet = true;
                    this.fiveCardsInHand = false;
                    this.room.send(ClientMessage.CardDropStichZone, {card:this.tempCard, id:this.tempCard.id});    
                    this.destroyAllMeldeButtons();
                    console.log("Karte ",gameObject.id ," auf Stich gelegt");
                }
                else{
                    if(gameObject.onHand == false){
                        gameObject.x = gameObject.input.dragStartX;
                        gameObject.y = gameObject.input.dragStartY;
                    }
                    else{
                        this.ownZone.addCard(gameObject);
                        this.ownZone.updateCardPosition();
                        gameObject.y = this.ownZone.dropZone.y;
                        this.room.send(ClientMessage.CardDropOwnZone, {id:this.tempCard.id});
                    }
                }
                
                 
            }
            //----------------------------Ablegen einer Karte auf eigener Hand-----------------------------------------------------//
            else if(target == this.ownZone.dropZone){
                if(target.data.values.cards >= 5){
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                    return
                }
                this.ownZone.addCard(gameObject);
                this.ownZone.updateCardPosition();
                if(target.data.values.cards == 5){
                    this.fiveCardsInHand = true;
                    if(this.firstTurn == false){
                        this.testForMelden();
                    }
                }
                gameObject.y = target.y;
                gameObject.onHand = true;
                this.room.send(ClientMessage.CardDropOwnZone, {id:this.tempCard.id});
            }
            //----------------------------RAUB--------------------------------------------------------------------------------------//
            else if(target == this.trumpfCard && this.fiveCardsInHand){                 //falls ein Spieler eine Karte auf der Trumpfkarte ablegt, wird überprüft, ob ein Raub stattfinden kann
                console.log("Raub");
                if(gameObject.color == this.trumpfCard.color && gameObject.value == 0){         //die Farbe muss übereinstimmen und es muss sich um eine sieben handeln
                    var tempx = this.trumpfCard.x;
                    var tempy = this.trumpfCard.y;
                   //füge die Trumpfkarte zur eigenen Zone hinzu
                    this.ownZone.addCard(this.trumpfCard);
                    this.trumpfCard.y = this.ownZone.dropZone.y;
                    this.ownZone.updateCardPosition();
                    this.trumpfCard.onHand = true;
                    this.trumpfCard.draggable = true;
                    this.trumpfCard.setInteractive(undefined,undefined,false);
                    //lege die abgelegte Karte als neue Trumpfkarte fest, diese kann nicht geraubt werden
                    gameObject.x = tempx;
                    gameObject.y = tempy;
                    gameObject.onHand = false;
                    gameObject.draggable = false;
                    this.room.send(ClientMessage.stealTrumpf, {newTrumpf: gameObject.id, oldTrumpf: this.trumpfCard.id, oldTrumpfX: this.trumpfCard.x, oldTrumpfY: this.trumpfCard.y});
                    this.room.send(ClientMessage.CardMove, {card:this.trumpfCard, id:this.trumpfCard.id});
                    this.trumpfCard = gameObject;
                }
                else{
                    this.ownZone.addCard(gameObject);
                    this.ownZone.updateCardPosition();
                    gameObject.y = this.ownZone.dropZone.y;
                    this.room.send(ClientMessage.CardDropOwnZone, {id:this.tempCard.id});
                }
            }
            else{
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
                        element.y = this.centerY + (this.centerY - message.card.y);
                    }
                }
           });
        })

        this.room.onMessage(ClientMessage.startTurn,(message) =>{
           this.firstTurn = true;
           this.button = new Button({
            scene: this,
            x:this.centerX,
            y:this.gameHeight-380,
            text: 'Auf Dissle',
            depth: 1,
            texture: 'button',
            scale: 0.7,
            font: "36px Arial"
           })

           this.button.on('pointerdown', (pointer,gameObject) =>{
                console.log("ButtonClicked")
                this.firstTurn = false;
                this.room.send(ClientMessage.AufDissle);
                this.button.text.destroy();
                this.button.destroy();
            });
        })
        //Beim der Spieleröffnung wird die Art der Spieleröffnung als Text erstellt, um alle Spieler zu informieren
        this.room.onMessage(ClientMessage.secondTurn,(message) =>{
            this.firstTurn = true;
            this.text = this.add.text(this.centerX-50,this.gameHeight-280,message,{ font: "30px Arial", color: '0x000000' });
        })

        //Falls man Spieler 2 ist, muss die Position des Decks geändert werden
        this.room.onMessage(ClientMessage.UpdateDeckPosition,(message) =>{
            this.cards.forEach(element => {
                element.x = this.centerX-200;
            });
            
        })
        //Der Server schickt eine Nachricht, dass die Karte in die Hand eines Mitspielers gelegt wurde. Verdecke diese Karte.
        this.room.onMessage(ClientMessage.CardDropOwnZone,(message) =>{
            this.cards.forEach(element => {
                if(message.id == element.id && (element.gemeldet == false)){
                    element.setTexture(element.cardback);
                    element.input.enabled = false;
                }
            });
        })

        this.room.onMessage(ClientMessage.CardDropStichZone,(message) =>{
            this.cards.forEach(element => {
                if(message.id == element.id){
                    element.input.enabled = false;
                    element.x = message.card.x;
                    element.y = message.card.y;
                    if(!this.firstCardSet){
                        this.firstCard = element;
                        this.firstCardSet = true;               //dieser Boolean sorgt dafür, dass die erste Karte nicht durch die nächste Karte, welche auf dem Stich gelegt wird, ersetzt wird
                    }
                }
            });
        })
        //Der Server schickt eine Nachricht, dass eine Karte von einem Mitspieler aus seiner Hand bewegt wurde. Die Texture dieser Karte muss geupdatet werden(verdeckt oder nicht verdeckt).
        this.room.onMessage(ClientMessage.CardUpdate,(message) =>{
            this.cards.forEach(element => {
                if(message.id == element.id){
                    element.setTexture(message.card.textureKey);
                }
            });
        })
        //es ist dein Zug, du kannst Karten bewegen
        this.room.onMessage(ClientMessage.YourTurn,(message) =>{
            this.cards.forEach(element => {
                element.setDraggAble(true);
            })
            if(this.trumpfCard){
                this.trumpfCard.setDraggAble(false);
            }
            this.firstCardOnStich = message.first;
            
        })
        //dein Zug ist zuende, du kannst keine Karten bewegen, aber du kannst Karten noch umdrehen
        this.room.onMessage(ClientMessage.EndTurn,(message) =>{
            this.firstTurn = false;
            this.firstCardSet = false;   
            this.destroyAllMeldeButtons();
            this.cards.forEach(element => {
                element.setDraggAble(false);
            })
            if(this.text){
                this.text.destroy();                   //entfernt den Text, welche den über die Spieleröffnung informiert hat
            }
        })
        //legt die erste Karte als Trumpfkarte fest
        this.room.onMessage(ClientMessage.setTrumpfColor,(message) => {
            if(this.text){
                this.text.destroy();                   //entfernt den Text, welche den über die Spieleröffnung informiert hat
            }
            if(this.pos == 1){
                this.cards[0].x = this.centerX-200;
            }
            else{
                this.cards[0].x = this.centerX+200;
            }
            this.cards[0].y = this.centerY;
            this.cards[0].setTexture(this.cards[0].cardname)
            this.trumpfCard = this.cards[0];    	  //speichere Trumpfkarte
            this.cards[0].setInteractive(undefined,undefined,true);
            this.cards[0].draggable = false;
            console.log(this.cards[0]);
            this.room.send(ClientMessage.updateTrumpfColor,{id:this.cards[0].id, color: this.cards[0].color})
        })
        //legt die in der Nachricht enthaltenden Karte als Trumpfkarte fest
        this.room.onMessage(ClientMessage.updateTrumpfColor,(message) =>{
            if(this.text){
                this.text.destroy();                   //entfernt den Text, welche den über die Spieleröffnung informiert hat
            }               
            this.cards.forEach(element => {
                if(element.id == message.id){
                    if(this.pos == 1){
                        element.x = this.centerX-200;
                    }
                    else{
                        element.x = this.centerX+200;
                    }
                    element.y = this.centerY;
                    element.setTexture(element.cardname)
                    element.setInteractive(undefined,undefined,true);
                    element.draggable = false;
                    console.log(element.draggable);
                    this.trumpfCard = element;          //speichere die Trumpfkarte
                }
            })
        })
        //falls der Server den Spieler benachrichtigt, dass er den Stich gewonnen hat, wird der aktuelle Stich auf seinen Stapel an gewonnen Karten gelegt
        this.room.onMessage(ClientMessage.winStich,(message) =>{
            this.stichSet = false;
            message.cards.forEach(id => {
                this.cards.forEach(card => {
                    if(card.id == id){
                        card.depth = 1;
                        card.x = this.centerX-500;
                        card.y = this.gameHeight-125;
                        card.setTexture(card.cardback);
                        card.input.enabled = false;
                        this.room.send(ClientMessage.CardMove,{card:card, id:card.id})
                    }
                })     
            });
        })

        this.room.onMessage(ClientMessage.loseStich,(message) =>{
            this.stichSet = false;
            message.cards.forEach(id => {
                this.cards.forEach(card => {
                    if(card.id == id){
                        card.setTexture(card.cardback);
                        card.input.enabled = false;
                    }
                })     
            });
        })
        //hat ein anderer Spieler ein oder mehrere Kartenpaare gemeldet, werden diese aufgedeckt
        this.room.onMessage(ClientMessage.melden,(message) =>{
            message.cards.forEach(id => {
                this.cards.forEach(card => {
                    if(card.id == id){
                        card.setTexture(card.cardname);
                        card.gemeldet = true;
                    }
                })     
            });
        })

        this.room.onMessage(ClientMessage.youAreTheWinner,(message) =>{
            this.text = this.add.text(this.centerX-120,this.centerY+270,"You Won",{ font: "60px Arial" , color: '0x000000'});
            this.cards.forEach(element => {
                element.setDraggAble(false);
            })
        })

        this.room.onMessage(ClientMessage.youAreTheLoser,(message) =>{
            this.text = this.add.text(this.centerX-120,this.centerY+270,"You Lose",{ font: "60px Arial" , color: '0x000000'});
            this.cards.forEach(element => {
                element.setDraggAble(false);
            })
        })

        this.room.onMessage(ClientMessage.stealTrumpf,(message) =>{
            var oldTrumpf! : CardDraggable;
            this.cards.forEach(card => {
                if(card.id == message.newTrumpf){
                    this.trumpfCard = card;
                }
                if(card.id == message.oldTrumpf){
                    oldTrumpf = card;
                }
            })
            //vertausche die Position der beiden Karten
            this.trumpfCard.x = oldTrumpf.x;
            this.trumpfCard.y = oldTrumpf.y;
            this.trumpfCard.setDraggAble(false);
            oldTrumpf.setDraggAble(false);
            oldTrumpf.setInteractive(undefined,undefined,false);
            oldTrumpf.setTexture(oldTrumpf.cardback);
            
        })
        this.room.onMessage(ClientMessage.setPos,(message) =>{
            console.log(message.pos);
            this.configurePos(message.pos);
        })

        this.room.onMessage(ClientMessage.farbZwang,(message) =>{
            this.farbZwang = true;
        })

        this.room.onMessage(ClientMessage.updatePoints,(message) =>{
            if(this.pointCounter){
                this.pointCounter.destroy();
            }
            var tempString : string = "Team-Punkte: " + message.points;
            this.pointCounter = this.add.text(0,0,tempString,{ font: "60px Arial" , color: '0x000000'});
        })
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
    //diese Methode testet ob der Spieler melden kann
    testForMelden(){
        console.log(this.ownZone.cards)
        var info = this.ownZone.testIfMelden();
        var x = 0;
        console.log(info);
        var stepX = 100;
        if(info.eichelMatch && (this.eichelGemeldet == false)){
            this.eichelMeldenButton = new Button({
                scene: this,
                x:this.centerX+x,
                y:this.gameHeight-380,
                text: 'MeldeEichel',
                depth: 1,
                texture: 'button',
                scale: 0.6,
                font: "24px Arial"
            })
            //erstelle ein Button, welches bei Ausführung das Kartenpaar an den Server meldet
            this.eichelMeldenButton.on('pointerdown', (pointer,gameObject) =>{
                console.log("ButtonClicked")
                this.room.send(ClientMessage.melden,{cards: info.eichel});
                this.eichelGemeldet = true;
                this.pairGemeldet = true;               //ein Paar wurde gemeldet
                info.eichel.forEach(id => {
                    this.cards.forEach(card => {
                        if(card.id == id){
                            card.setTexture(card.cardname);
                            card.gemeldet = true;
                        }
                    })     
                });   
                this.destroyAllMeldeButtons();
            });
            x += stepX;
        }

        if(info.blattMatch && (this.blattGemeldet == false)){
            this.blattMeldenButton = new Button({
                scene: this,
                x:this.centerX+x,
                y:this.gameHeight-380,
                text: 'MeldeBlatt',
                depth: 1,
                texture: 'button',
                scale: 0.6,
                font: "24px Arial"
            })
            //erstelle ein Button, welches bei Ausführung das Kartenpaar an den Server meldet
            this.blattMeldenButton.on('pointerdown', (pointer,gameObject) =>{
                console.log("ButtonClicked")
                this.room.send(ClientMessage.melden,{cards: info.blatt});
                this.blattGemeldet = true;
                this.pairGemeldet = true;               //ein Paar wurde gemeldet
                info.blatt.forEach(id => {
                    this.cards.forEach(card => {
                        if(card.id == id){
                            card.setTexture(card.cardname);
                            card.gemeldet = true;
                        }
                    })     
                });
                this.destroyAllMeldeButtons();
            });
            x += stepX;
            
        }

        if(info.herzMatch && (this.herzGemeldet == false)){
            this.herzMeldenButton = new Button({
                scene: this,
                x:this.centerX+x,
                y:this.gameHeight-380,
                text: 'MeldeHerz',
                depth: 1,
                texture: 'button',
                scale: 0.6,
                font: "24px Arial"
            })
            //erstelle ein Button, welches bei Ausführung das Kartenpaar an den Server meldet
            this.herzMeldenButton.on('pointerdown', (pointer,gameObject) =>{
                console.log("ButtonClicked")
                this.room.send(ClientMessage.melden,{cards: info.herz});
                this.herzGemeldet = true;
                this.pairGemeldet = true;               //ein Paar wurde gemeldet
                info.herz.forEach(id => {
                    this.cards.forEach(card => {
                        if(card.id == id){
                            card.setTexture(card.cardname);
                            card.gemeldet = true;
                        }
                    })     
                });
                this.destroyAllMeldeButtons();
            });
            x += stepX;
        }

        if(info.schellenMatch && (this.schellenGemeldet == false)){
            this.schellenMeldenButton = new Button({
                scene: this,
                x:this.centerX+x,
                y:this.gameHeight-380,
                text: 'MeldeSchelle',
                depth: 1,
                texture: 'button',
                scale: 0.6,
                font: "24px Arial"
            })
            //erstelle ein Button, welches bei Ausführung das Kartenpaar an den Server meldet
            this.schellenMeldenButton.on('pointerdown', (pointer,gameObject) =>{
                console.log("ButtonClicked")
                this.room.send(ClientMessage.melden,{cards: info.schellen});
                this.schellenGemeldet = true;
                this.pairGemeldet = true;               //ein Paar wurde gemeldet
                info.schellen.forEach(id => {
                    this.cards.forEach(card => {
                        if(card.id == id){
                            card.setTexture(card.cardname);
                            card.gemeldet = true;
                        }
                    })     
                });
                this.destroyAllMeldeButtons();
            });
            x += stepX;
        }
        
    }
    destroyAllMeldeButtons(){
        if(this.eichelMeldenButton){
            this.eichelMeldenButton.text.destroy();
            this.eichelMeldenButton.destroy();
        }
        if(this.blattMeldenButton){
            this.blattMeldenButton.text.destroy();
            this.blattMeldenButton.destroy();
        }
        if(this.herzMeldenButton){
            this.herzMeldenButton.text.destroy();
            this.herzMeldenButton.destroy();
        }
        if(this.schellenMeldenButton){
            this.schellenMeldenButton.text.destroy();
            this.schellenMeldenButton.destroy();
        }
        
    }
    configurePos(pos : number){
        this.pos = pos;
        this.enemyZone = new PlayerZone(this,this.centerX,125,750,250,0xff0000);
        this.ownZone = new PlayerZone(this,this.centerX,this.gameHeight-125,750,250,0x00ff00);
    }

    update(t: number, dt: number)
    {
        
    }
}

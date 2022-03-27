import Phaser from 'phaser'
import CardDraggable from './CardDraggable'
export default class CardZone {
    dropZone;
    dropZoneOutline;
    cards = [];
    constructor(scene,x,y,width,height) {
        this.dropZone = scene.add.zone(x,y,width,height).setRectangleDropZone(width,height);
        this.dropZone.setData({ cards: 0 });
        this.dropZoneOutline = scene.add.graphics();
        this.dropZoneOutline.lineStyle(4, 0xff69b4);
        this.dropZoneOutline.strokeRect(this.dropZone.x - this.dropZone.input.hitArea.width / 2, this.dropZone.y - this.dropZone.input.hitArea.height / 2, this.dropZone.input.hitArea.width, this.dropZone.input.hitArea.height)   
    }

    addCard(card){
        this.dropZone.data.values.cards++;
        this.cards.push(card);
    }

    removeCard(card){
        this.dropZone.data.values.cards--;
        var cardIndex = this.cards.findIndex((tempCard) => card.id == tempCard.id);
        this.cards.splice(cardIndex,1)
    }

    //diese Methode überprüft ob sich ein Koenig und ein Ober derselben Farbe sich auf der Hand befinden. Die IDs aller Koenige und Ober sowie gefundene Paare werden zurückgegeben 
    testIfMelden(){
        var eichelArray = [];
        var blattArray = [];
        var herzArray = [];
        var schellenArray = [];
        var eichelKing = false;
        var blattKing = false;
        var herzKing = false;
        var schellenKing = false;
        var eichelMatch = false;
        var blattMatch = false;
        var herzMatch = false;
        var schellenMatch = false;
        this.cards.forEach(card => { 
            if(card.symbol == "koenig"){
                switch(card.symbol){
                    case "eichel":
                        eichelArray.push(card.id);
                        eichelKing = true;
                        break;
                    case "blatt":
                        blattKing = true;
                        blattArray.push(card.id);
                        break;
                    case "herz":
                        herzKing = true;
                        herzArray.push(card.id);
                        break;
                    case "schellen":
                        schellenKing = true;
                        schellenArray.push(card.id);
                        break;
                    default:
                }
            }
        })
        this.cards.forEach(card => { 
            if(card.symbol == "ober"){
                switch(card.symbol){
                    case "eichel":
                        if(eichelKing){
                            eichelArray.push(card.id);
                            eichelMatch = true;
                        }
                        break;
                    case "blatt":
                        if(blattKing){
                            eichelArray.push(card.id);
                            blattMatch = true;
                        }
                        break;
                    case "herz":
                        if(herzKing){
                            eichelArray.push(card.id);
                            herzMatch = true;
                        }
                        break;
                    case "schellen":
                        if(schellenKing){
                            eichelArray.push(card.id);
                            schellenMatch = true;
                        }
                        break;
                    default:
                }
            }
        })

        return {eichelMatch: eichelMatch, eichel: eichelArray, blattMatch: blattMatch, blatt: blattArray,herzMatch: herzMatch, herz: herzArray, schellenMatch: schellenMatch, schellen: schellenArray}
    }
}
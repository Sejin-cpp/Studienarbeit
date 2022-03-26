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

    testIfMelden(){
        var eichelArray = [];
        var blattArray = [];
        var herzArray = [];
        var schellenArray = [];
        this.cards.forEach(card => { 
            if(card.symbol == "ober" || card.symbol == "koenig"){
                switch(card.symbol){
                    case "eichel":
                        eichelArray.push(card.id);
                        break;
                    case "blatt":
                        blattArray.push(card.id);
                        break;
                    case "herz":
                        herzArray.push(card.id);
                        break;
                    case "schellen":
                        schellenArray.push(card.id);
                        break;
                    default:
                }
            }
        })

        return {eichel: eichelArray, blatt: blattArray, herz: herzArray, schellen: schellenArray}
    }
}
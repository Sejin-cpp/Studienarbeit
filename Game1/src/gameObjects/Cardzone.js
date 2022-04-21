import Phaser from 'phaser'
import CardDraggable from './CardDraggable'
export default class CardZone {
    dropZone;
    dropZoneOutline;
    rectangle;
    cards = [];
    constructor(scene,x,y,width,height,color) {
        this.dropZone = scene.add.zone(x,y,width,height).setRectangleDropZone(width,height);
        this.rectangle = scene.add.rectangle(x,y,width,height,{fillColor: '0x000000'});
        this.rectangle.depth = 2;
        this.dropZone.setData({ cards: 0 });
        this.dropZoneOutline = scene.add.graphics();
        this.dropZoneOutline.lineStyle(6, color);
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

    
}
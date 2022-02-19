import Phaser from 'phaser'
export default class CardZone {
    dropZone;
    dropZoneOutline;
    constructor(scene,x,y,width,height) {
            this.dropZone = scene.add.zone(x,y,width,height).setRectangleDropZone(width,height);
            this.dropZoneOutline = scene.add.graphics();
            this.dropZoneOutline.lineStyle(4, 0xff69b4);
            this.dropZoneOutline.strokeRect(this.dropZone.x - this.dropZone.input.hitArea.width / 2, this.dropZone.y - this.dropZone.input.hitArea.height / 2, this.dropZone.input.hitArea.width, this.dropZone.input.hitArea.height)   
        }
}
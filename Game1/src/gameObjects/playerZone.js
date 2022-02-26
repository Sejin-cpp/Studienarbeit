import CardZone from "./Cardzone"
export default class PlayerZone extends CardZone {
    xPos;
    yPos;
    tempX;
    constructor(scene,x,y,width,height) {
        super(scene,x,y,width,height)
        this.xPos = x-300;
        this.yPos = y;
    }

    updateCardPosition(){
        this.tempX = this.xPos;
        this.cards.forEach(element => {
           element.x = this.tempX;
           element.y = this.yPos;
           this.tempX += 150;
        });
    }
}
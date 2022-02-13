import Phaser from 'phaser'
export default class CardBase extends Phaser.GameObjects.Container{
    isHidden = true;
    constructor(data){
        let {scene,x,y,cardname,depth,color,symbol,value,cardback} = data
        let frontImg = new Phaser.GameObjects.Image(scene,0,0,cardname)
        let cardbackImg = new Phaser.GameObjects.Image(scene,0,0,cardback)
        super(scene,x,y,[frontImg],[cardbackImg])
        this.frontImg = frontImg
        this.cardbackImg = cardbackImg
        this.image = cardbackImg
        this.depth = depth
        this.scene = scene
        this.color = color
        this.symbol = symbol
        this.value = value
        this.scene.add.existing(this);
    }

    changeSide(){
        if(isHidden){
            this.image = this.cardbackImg
        }
        else{
            this.image = this.frontImg
        }
    }
}
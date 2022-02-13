import Phaser from 'phaser'
export default class CardBase extends Phaser.GameObjects.Container{
    isHidden = false;
    constructor(data){
        let {scene,x,y,cardname,depth,color,symbol,value,cardback} = data
        let frontImg = new Phaser.GameObjects.Image(scene,0,0,cardname)
        let cardbackImg = new Phaser.GameObjects.Image(scene,0,0,cardback)
        super(scene,x,y,[cardbackImg])
        this.frontImg = frontImg
        this.cardbackImg = cardbackImg
        this.image = frontImg
        this.depth = depth
        this.scene = scene
        this.color = color
        this.symbol = symbol
        this.value = value
        this.scene.add.existing(this);

        this.scene.input.on('pointerdown', function (pointer) {

            if (pointer.rightButtonDown())
            {
                if(isHidden){
                    this.image = this.cardbackImg
                }
                else{
                    this.image = this.frontImg
                }
            }
    
        }, this);
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
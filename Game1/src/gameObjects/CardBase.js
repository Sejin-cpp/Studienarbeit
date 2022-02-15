import Phaser from 'phaser'
export default class CardBase extends Phaser.GameObjects.Sprite{
    constructor(data){
        let {id,scene,x,y,cardname,depth,color,symbol,value,cardback, scale} = data;
        super(scene,x,y,"");
        this.id = id;
        this.cardname = cardname;
        this.scale = scale;
        this.cardback = cardback;
        this.setTexture(cardback);
        this.image = cardback;
        this.depth = depth;
        this.scene = scene;
        this.color = color;
        this.symbol = symbol;
        this.value = value;
        this.scene.add.existing(this);

       
    }
}
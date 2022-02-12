import Phaser from 'phaser'
export default class CardBase extends Phaser.GameObjects.Container{
    constructor(data){
        let {scene,x,y,name,card,depth} = data;
        let spriteCard = new Phaser.GameObjects.Sprite(scene,0,0,card);
        super(scene,x,y,[spriteCard]);
        this.spriteCard = spriteCard;
        this.cardname = name;
        this.depth = depth;
        this.scene = scene;
        this.scene.add.existing(this);
    }
}
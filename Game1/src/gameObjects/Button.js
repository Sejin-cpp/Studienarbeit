import Phaser from 'phaser'
export default class Button extends Phaser.GameObjects.Sprite{
    constructor(data){
        let {id,scene,x,y,text,depth,texture, scale, font} = data;
        super(scene,x,y,"");
        this.id = id;
        this.text = text;
        this.scale = scale;
        this.texture = texture;
        this.setTexture(texture);
        this.depth = depth;
        this.scene = scene;
        this.scene.add.existing(this);
        this.text = this.scene.add.text(x-80,y-10,text,{ font: font });
        this.text.depth = this.depth+1;
        this.text.setColor('purple');
        this.setInteractive();
    }
}
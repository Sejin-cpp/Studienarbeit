import Phaser from 'phaser'
export default class CardBase extends Phaser.GameObjects.Container{
    constructor(data){
        let {scene,x,y,cardname,depth} = data;
        let image = new Phaser.GameObjects.Image(scene,0,0,cardname)
        super(scene,x,y,[image]);
        this.image = image;
        this.depth = depth;
        this.scene = scene;
        this.scene.add.existing(this);
    }
}
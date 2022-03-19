import CardBase from "./CardBase.js";

export default class CardDraggable extends CardBase{
    constructor(data){
        let {ondragend, width, height} = data;
        super(data);
        this.originalX = this.x;
        this.originalY = this.y;
        this.draggable = true;
        this.dragging = false;
        this.hidden = true;
        this.ondragend = ondragend;
        this.width = width;
        this.height = height;
        this.setSize(this.image.width, this.image.height),
        this.setInteractive();
        this.scene.input.setDraggable(this);
        
    }

    setDraggAble(draggable){
        this.draggable = draggable;
    }

    flip(){
       this.input.enabled = false;
       const timeline = this.scene.tweens.timeline({
           onComplete: () => {
               timeline.destroy();
           }
       });

       timeline.add({
            targets: this,
            scale: this.scale+0.1,
            duration: 200
       });

       timeline.add({
            targets: this,
            scaleX: 0,
            duration: 200,
            delay: 200,
            onComplete: () =>{
                if(this.hidden == true)
                {
                    this.setTexture(this.cardname); 
                    this.hidden = false;
                }
                else{
                    this.setTexture(this.cardback);
                    this.hidden = true;
                }
            }
        });

       timeline.add({
            targets: this,
            scaleX: this.scale+0.1,
            duration: 200,
        });

        timeline.add({
            targets: this,
            scale: this.scale,
            duration: 200
       });
       timeline.play();
       this.input.enabled = true;
    }
}
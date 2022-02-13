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

        this.scene.input.on('drag',(pointer,gameObject,dragX,dragY) =>{
            if(!this.draggable) return;
            this.dragging = true;
            gameObject.x = dragX;
            gameObject.y = dragY;
            
        });
        
        this.scene.input.on('dragend',(pointer,gameObject) =>{
            this.dragging = false;
            gameObject.ondragend(pointer, gameObject);
        });
        
        this.on('pointerdown', (pointer,gameObject) =>{
            
            if (pointer.rightButtonDown())
            {
                this.flip()
            }
        });
        
    }

    flip(){
       const timeline = this.scene.tweens.timeline({
           onComplete: () => {
               timeline.destroy();
           }
       });

       timeline.add({
            targets: this,
            scale: 1.1,
            duration: 300
       });

       timeline.add({
            targets: this,
            scaleX: 0,
            duration: 300,
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
            scaleX: 1.1,
            duration: 300,
        });

        timeline.add({
            targets: this,
            scale: 1,
            duration: 300
       });
       timeline.play();
    }
}
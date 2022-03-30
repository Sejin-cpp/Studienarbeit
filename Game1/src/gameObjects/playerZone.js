import CardZone from "./Cardzone"
export default class PlayerZone extends CardZone {
    xPos;
    yPos;
    tempX;
    constructor(scene,x,y,width,height,color) {
        super(scene,x,y,width,height,color)
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

    //diese Methode überprüft ob sich ein Koenig und ein Ober derselben Farbe sich auf der Hand befinden. Die IDs aller Koenige und Ober sowie gefundene Paare werden zurückgegeben 
    testIfMelden(){
        var eichelArray = [];
        var blattArray = [];
        var herzArray = [];
        var schellenArray = [];
        var eichelKing = false;
        var blattKing = false;
        var herzKing = false;
        var schellenKing = false;
        var eichelMatch = false;
        var blattMatch = false;
        var herzMatch = false;
        var schellenMatch = false;
        this.cards.forEach(card => { 
            if(card.symbol == "koenig"){
                switch(card.symbol){
                    case "eichel":
                        eichelArray.push(card.id);
                        eichelKing = true;
                        break;
                    case "blatt":
                        blattKing = true;
                        blattArray.push(card.id);
                        break;
                    case "herz":
                        herzKing = true;
                        herzArray.push(card.id);
                        break;
                    case "schellen":
                        schellenKing = true;
                        schellenArray.push(card.id);
                        break;
                    default:
                }
            }
        })
        this.cards.forEach(card => { 
            if(card.symbol == "ober"){
                switch(card.symbol){
                    case "eichel":
                        if(eichelKing){
                            eichelArray.push(card.id);
                            eichelMatch = true;
                        }
                        break;
                    case "blatt":
                        if(blattKing){
                            eichelArray.push(card.id);
                            blattMatch = true;
                        }
                        break;
                    case "herz":
                        if(herzKing){
                            eichelArray.push(card.id);
                            herzMatch = true;
                        }
                        break;
                    case "schellen":
                        if(schellenKing){
                            eichelArray.push(card.id);
                            schellenMatch = true;
                        }
                        break;
                    default:
                }
            }
        })

        return {eichelMatch: eichelMatch, eichel: eichelArray, blattMatch: blattMatch, blatt: blattArray,herzMatch: herzMatch, herz: herzArray, schellenMatch: schellenMatch, schellen: schellenArray}
    }
}
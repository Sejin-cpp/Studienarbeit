import CardZone from "./CardZone"
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
                switch(card.color){
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
                switch(card.color){
                    case "eichel":
                        if(eichelKing){
                            eichelArray.push(card.id);
                            eichelMatch = true;
                        }
                        break;
                    case "blatt":
                        if(blattKing){
                            blattArray.push(card.id);
                            blattMatch = true;
                        }
                        break;
                    case "herz":
                        if(herzKing){
                            herzArray.push(card.id);
                            herzMatch = true;
                        }
                        break;
                    case "schellen":
                        if(schellenKing){
                            schellenArray.push(card.id);
                            schellenMatch = true;
                        }
                        break;
                    default:
                }
            }
        })

        return {eichelMatch: eichelMatch, eichel: eichelArray, blattMatch: blattMatch, blatt: blattArray,herzMatch: herzMatch, herz: herzArray, schellenMatch: schellenMatch, schellen: schellenArray}
    }
    //diese Methode überprüft, ob diese Hand eine Karte besitzt, dessen Farbe mit der übergebenen Farbe übereinstimmt. Diese Methode wird beim Farbzwang eingesetzt, da da der Spieler eine Karte derselben Farbe legen muss
    testForFarbZwang(color){
        var colorInHand = false;
        this.cards.forEach(card => { 
            console.log(card.color);
            if(card.color == color){
                colorInHand = true;
            }
        })
        return colorInHand;
    }
}
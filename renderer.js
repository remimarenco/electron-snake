// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
}

class Game {
    constructor(context) {
        this.elements = new Array();
        this.context = context;
    }
    
    addElement(element) {
        this.elements.push(element);
    }
    
    run() {
        var that = this;
        setInterval(function() { that.tick(); }, 500);
    }
    
    clearScreen() {
        this.context.beginPath();
        this.context.rect(0, 0, 320, 240);
        this.context.fillStyle = "white";
        this.context.fill();
    }
    
    tickElement() {
        var that = this;
        return function(element) {
            console.log("tick ");
            console.log(element);
            element.tick();
            element.draw(that.context);
        }
    }
    
    tick() {
        console.log("Tick!");
        this.clearScreen()
        this.elements.forEach(this.tickElement());
    }
}

class Element {

    constructor() {
        this.x = 10;
        this.y = 10;
    }

    tick() {
        
    }
    
    draw(context) {
        
    }
}

class Snake extends Element {

    constructor() {
        super();
        this.direction = DIRECTION.RIGHT;
    }
    
    moveUp() {
        --this.y;
    }
    
    moveRight() {
        ++this.x;
    }
    
    moveDown() {
        ++this.y;
    }
    
    moveLeft() {
        --this.x;
    }
    
    tick() {
        switch(this.direction) {
        case DIRECTION.UP:
            this.moveLeft();
            break;
        case DIRECTION.RIGHT:
            this.moveRight();
            break;
        case DIRECTION.DOWN:
            this.moveDown();
            break;
        case DIRECTION.LEFT:
            this.moveLeft();
            break;
        }
    }
    
    draw(context) {
        // Draw the head
        context.beginPath();
        context.rect(this.x * 5, this.y * 5, 5, 5);
        context.fillStyle = "red";
        context.fill();
    }
}

let canvas = document.getElementById("game");
let context = canvas.getContext("2d");

let snake = new Snake();
let game = new Game(context);
game.addElement(snake);
game.run();
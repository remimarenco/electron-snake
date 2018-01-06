// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
}

const SCALE = 30;
const WIDTH = 30;
const HEIGHT = 30;


class GameState {

    constructor(game) {
        this.game = game;
    }

    draw() {

    }

    handleKeyPress(keyName) {

    }

    tick() {

    }

    resume() {

    }
}

class RunningState extends GameState {

    constructor(game) {
        super(game);
    }

    handleKeyPress(keyName) {
        switch(keyName) {
        case "ArrowUp":
        case "z":
            this.game.snake.goUp();
            break;
        case "ArrowRight":
        case "d":
            this.game.snake.goRight();
            break;
        case "ArrowDown":
        case "s":
            this.game.snake.goDown();
            break;
        case "ArrowLeft":
        case "q":
            this.game.snake.goLeft();
            break;
        case " ":
            this.game.changeState(new PauseState(this.game));
            break;
        }
    }

    tick() {
        console.log("tick");
        this.game.elements.forEach((element) => {
            element.tick();
        });
        this.game.ticked();
    }

    resume() {
        this.game.resumeDrawer();
        this.game.resumeTicker();
    }

    draw() {
        this.game.clearScreen();
        this.game.elements.forEach((element) => {
            element.draw(this.game.context);
        });
    }
}

class PauseState extends GameState {
    constructor(game) {
        super(game);
    }

    handleKeyPress(keyName) {
        switch(keyName) {
        case " ":
            this.game.changeState(new RunningState(this.game));
            break;
        }
    }

    resume() {
        this.game.stopTicker();
        this.game.stopDrawer();

        this.draw();
    }

    tick() {

    }

    draw() {
        let ctx = this.game.context;
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.font = "50px Arial";
        ctx.fillText("PAUSE",
                     (WIDTH*SCALE)/2,
                     (HEIGHT*SCALE)/2);
        console.log("Drawn");
    }

}

class GameOverState extends GameState {
    constructor(game) {
        super(game);
    }

    resume() {
        this.game.stopTicker();
        this.game.stopTicker();

        this.draw();
    }

    tick() {

    }

    draw() {
        let ctx = this.game.context;
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.font = "50px Arial";
        ctx.fillText("GAME OVER",
                     (WIDTH*SCALE)/2,
                     (HEIGHT*SCALE)/2);
    }
}

class Game {
    constructor(context, snake, width, height) {
        this.elements = new Array();
        this.context = context;
        this.snake = snake;
        
        this.seed = new Seed(0, 0);
        
        // Add the snake after the seed.
        this.addElement(this.seed);
        this.addElement(this.snake);

        this.ticker = null;
        this.drawer = null;

    }

    changeState(state) {
        this.state = state;
        this.state.resume();
    }
    
    pickRandomSeedCoordinates() {
        return [Math.floor(Math.random()*WIDTH),
                Math.floor(Math.random()*HEIGHT)];
    }
    
    resetSeed() {
        let coords;
        do {
            coords = this.pickRandomSeedCoordinates();
            console.log(coords);
        } while(this.seedCollide(coords[0], coords[1]));
        this.seed.x = coords[0];
        this.seed.y = coords[1];
        console.log("New seed at ("+ this.seed.x + ", " + this.seed.y + ")");
    }

    seedCollide(x, y) {
        let i;
        let elts = this.snake.body
        for(i = 0; i < elts.length; i++) {
            if (elts[i].x == x && elts[i].y == y) {
                return true;
            }
        }
        return false;
    }
    
    handleKeyPress(keyName) {
        this.state.handleKeyPress(keyName);
    }

    addElement(element) {
        this.elements.push(element);
    }
    

    resumeTicker() {
        this.ticker = setInterval(() => { this.tick(); }, 100);
        this.tick();
    }

    resumeDrawer() {
        this.drawer = setInterval(() => { this.draw(); }, 16);
        this.draw();
    }

    stopTicker() {
        clearInterval(this.ticker);
    }

    stopDrawer() {
        clearInterval(this.drawer);
    }
    
    run() {
        // Set new seed coordinates.
        this.resetSeed();
        this.changeState(new RunningState(this));
    }
    
    clearScreen() {
        this.context.beginPath();
        this.context.rect(0, 0, WIDTH * SCALE, HEIGHT * SCALE);
        this.context.fillStyle = "white";
        this.context.fill();
    }

    draw() {
        this.state.draw();
    }


    hasCollidedOneself() {
        let i;
        let body = this.snake.body;
        console.log("Check colliding");
        for(i = 0; i < body.length; i++) {
            if(body[i].x == this.snake.x &&
               body[i].y == this.snake.y)
            {
                console.log("Collide.");
                return true;
            }
        }
        return false;
    }
    
    
    ticked() {
        if (this.snake.x == this.seed.x && this.snake.y == this.seed.y) {
            this.resetSeed();
            this.snake.eatSeed();
        }
        else if (this.hasCollidedOneself()) {
            this.changeState(new GameOverState(this));
        }
    }
    
    tick() {
        this.state.tick();
    }
}

class Element {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    tick() {
        
    }
    
    draw(context) {
        
    }
}

class Seed extends Element {
    constructor(x, y) {
        super(x, y);
    }

    draw(context) {
        // Draw the head
        context.beginPath();
        context.rect(this.x * SCALE, this.y * SCALE, SCALE, SCALE);
        context.fillStyle = "blue";
        context.fill();
    }
}

class Snake extends Element {

    constructor() {
        super(10, 10);
        this.direction = DIRECTION.RIGHT;
        this.body = new Array();
    }
    
    moveUp() {
        --this.y;
        if(this.y < 0) {
            this.y = HEIGHT - 1;
        }
    }
    
    moveRight() {
        ++this.x;
        if(this.x == WIDTH) {
            this.x = 0;
        }
    }
    
    moveDown() {
        ++this.y;
        if(this.y == HEIGHT) {
            this.y = 0;
        }
    }
    
    moveLeft() {
        --this.x;
        if(this.x < 0) {
            this.x = HEIGHT - 1;
        }
    }
    
    goUp() {
        this.direction = DIRECTION.UP;
    }
    
    goRight() {
        this.direction = DIRECTION.RIGHT;
    }
    
    goDown() {
        this.direction = DIRECTION.DOWN;
    }
    
    goLeft() {
        this.direction = DIRECTION.LEFT;
    }
    
    moveBody() {
        if (this.body.length > 0) {
            let i;
            for(i = this.body.length-1; i > 0; --i) {
                this.body[i].x = this.body[i-1].x;
                this.body[i].y = this.body[i-1].y;
            }
            
            this.body[0].x = this.x;
            this.body[0].y = this.y;
        }
    }
    
    eatSeed() {
        let newElement = new Element(this.x, this.y);
        
        // Given the direction, shift the newElement's position.
        // E.g. if the snake goes up, it comes from the bottom. Then spawn
        // The new element towards the bottom.
        
        
        switch(this.direction) {
            case DIRECTION.UP:
                ++newElement.y;
                break;
            case DIRECTION.RIGHT:
                --newElement.x;
                break;
            case DIRECTION.DOWN:
                --newElement.y;
                break;
            case DIRECTION.LEFT:
                ++newElement.x;
                break;
        }
        
        this.body.push(newElement);
        console.log(this.body);
    }
    
    tick() {
        
        this.moveBody();

        switch(this.direction) {
        case DIRECTION.UP:
            this.moveUp();
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
    
    drawElement(context, element) {
        context.rect(element.x * SCALE, element.y * SCALE, SCALE, SCALE);
    }
    
    draw(context) {
        // Draw the head
        context.beginPath();
        context.fillStyle = "red";
        
        // Draw the head
        this.drawElement(context, this);
        
        // Draw the body
        this.body.forEach((element) => {
            this.drawElement(context, element);
        });

        context.fill();
    }
}

let canvas = document.getElementById("game");
canvas.width = SCALE * WIDTH;
canvas.height = SCALE * HEIGHT;
let context = canvas.getContext("2d");

let snake = new Snake();
let game = new Game(context, snake);

document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    game.handleKeyPress(keyName);
});

game.run();

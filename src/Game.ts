import Actor from './Actor.js';
import Player from './Player.js';
import Room from './Room.js';
import images from './images.js';

export default class Game {
    actors: Array<Actor> = [];
    currentRoom?: Room;
    timestamp = 0;

    constructor(readonly ctx: CanvasRenderingContext2D) {
        this.run = this.run.bind(this);
        this.actors.push(new Player(this));
        this.currentRoom = new Room(this);
        this.currentRoom.addWall(10, 10, 10, 200);
        this.currentRoom.addWall(400, 10, 10, 200);
        this.currentRoom.addWall(10, 10, 390, 10);
        this.currentRoom.addWall(10, 210, 390, 10);
    }

    run(timestamp: number) {
        const dt = timestamp - this.timestamp;

        this.tick(dt);
        this.draw();

        this.timestamp = timestamp;

        window.requestAnimationFrame(this.run);
    }

    tick(dt: number) {
        this.actors.forEach(actor => actor.tick(dt));
    }

    draw() {
        const ctx = this.ctx;
        const { canvas } = ctx;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images('image0'), 0, 0, canvas.width, canvas.height)

        this.currentRoom?.draw(ctx);
        this.actors.forEach(actor => actor.draw(ctx));
    }
}

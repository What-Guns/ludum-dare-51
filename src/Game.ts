import Actor from './Actor.js';
import Player from './Player.js';

export default class Game {
    actors: Array<Actor> = [];
    timestamp = 0;

    constructor(readonly ctx: CanvasRenderingContext2D) {
        this.run = this.run.bind(this);
        this.actors.push(new Player(this));
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

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(200, 200, 200, 200);

        this.actors.forEach(actor => actor.draw(ctx));
    }
}

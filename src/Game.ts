export default class Game {
    timestamp = 0;

    constructor(readonly ctx: CanvasRenderingContext2D) {
        this.run = this.run.bind(this);
    }

    run(timestamp: number) {
        const dt = timestamp - this.timestamp;

        this.tick(dt);
        this.draw();

        this.timestamp = timestamp;

        window.requestAnimationFrame(this.run);
    }

    tick(dt: number) {
        console.log(dt);
    }

    draw() {
        const ctx = this.ctx;
        const { canvas } = ctx;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(200, 200, 200, 200);
    }
}

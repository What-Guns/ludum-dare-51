import Actor from './Actor.js';
import Game from './Game.js';
import { Controls, isControlPressed } from './KeyboardInput.js';

export default class Player implements Actor {
    position: [number, number] = [100, 100];
    velocity: [number, number] = [0, 0];
    acceleration = 0.1;
    deceleration = 0.92;
    maximumVelocity = 1;

    constructor(readonly game: Game) { }

    tick(_dt: number) {
        this.processInput();
        this.clampVelocity();
        this.position[0] += this.vx;
        this.position[1] += this.vy;
        this.decelerate();
    }

    decelerate() {
        const { deceleration, velocity } = this;
        velocity[0] *= deceleration;
        velocity[1] *= deceleration;
    }

    processInput() {
        if (isControlPressed(Controls.RIGHT)) { this.velocity[0] += this.acceleration; }
        if (isControlPressed(Controls.LEFT)) { this.velocity[0] -= this.acceleration; }
        if (isControlPressed(Controls.UP)) { this.velocity[1] -= this.acceleration; }
        if (isControlPressed(Controls.DOWN)) { this.velocity[1] += this.acceleration; }
    }

    clampVelocity() {
        const { maximumVelocity, vx, vy, velocity } = this;
        if (vx == 0 && vy == 0) return; // Can't normalize the zero vector
        const magnitude = Math.sqrt((vx * vx) + (vy * vy));
        if (magnitude < maximumVelocity) return;
        velocity[0] = vx * (maximumVelocity / magnitude);
        velocity[1] = vy * (maximumVelocity / magnitude);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        const radius = 15;
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    get x() { return this.position[0] }
    get y() { return this.position[1] }
    get vx() { return this.velocity[0] }
    get vy() { return this.velocity[1] }
}

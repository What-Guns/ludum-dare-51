import Actor from './Actor.js';
import Game from './Game.js';
import Rect from './Rect.js';
import { Controls, isControlPressed } from './KeyboardInput.js';

export default class Player implements Actor {
    position: [number, number] = [100, 100];
    velocity: [number, number] = [0, 0];
    width = 30;
    height = 30;
    rect: Rect;
    acceleration = 0.1;
    deceleration = 0.92;
    maximumVelocity = 1;

    constructor(readonly game: Game) {
        this.rect = new Rect(this.x, this.y, this.width, this.height);
    }

    tick(_dt: number) {
        this.processInput();
        this.clampVelocity();
        this.updatePosition();
        this.checkForWallCollisions();
        this.decelerate();
    }

    updatePosition() {
        this.position[0] += this.vx;
        this.position[1] += this.vy;
        this.rect.x = this.x - (this.width / 2);
        this.rect.y = this.y - (this.height / 2);
    }

    checkForWallCollisions() {
        const walls = this.game.currentRoom?.walls || [];
        const collidingWalls = walls.filter(wall => wall.rect.collides(this.rect));
        if (collidingWalls.length == 0) return;
        collidingWalls.forEach(wall => this.resolveCollision(wall.rect));

    }

    resolveCollision(rect: Rect) {
        const [up, down, left, right] = this.rect.collisionDirections(rect);
        if (up) {
            this.position[1] = rect.y + rect.h + this.height / 2;
        }
        if (down) {
            this.position[1] = rect.y - this.height / 2;
        }
        if (left) {
            this.position[0] = rect.x + rect.w + this.width / 2;
        }
        if (right) {
            this.position[0] = rect.x - this.width / 2;
        }
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
        ctx.fillStyle = 'green';
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    }

    get x() { return this.position[0] }
    get y() { return this.position[1] }
    get vx() { return this.velocity[0] }
    get vy() { return this.velocity[1] }
}

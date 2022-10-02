import Actor from './Actor.js';
import Game from './Game.js';
import Rect from './Rect.js';
import { Tile } from './Room.js';

export default class Enemy implements Actor {
    position: [number, number] = [1100, 700];
    velocity: [number, number] = [0, 0];
    rect: Rect;
    width = 80;
    height = 80;

    pathToPlayer?: Array<Tile> = [];

    constructor(readonly game: Game) {
        this.rect = new Rect(this.x, this.y, this.width, this.height);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'red';
        //const positionIsometric = [this.x - (this.y * (86 / 50)), this.y + (this.x / (86 / 50))];
        /*const tileX = this.x / 40;
        const tileY = this.y / 50;
        const positionIsometric = [(tileX * 43) - (tileY * 43), (tileX * 25) + (tileY * 25)]*/
        const isoX = (this.x * 1.74) + (this.y * -1.76) + 1878;
        const isoY = (this.x) + (this.y) - 119;
        //ctx.fillRect((positionIsometric[0] + (window as any).offsetX), (positionIsometric[1] + (window as any).offsetY), 50, 150);
        ctx.fillRect(isoX / 4 - 25, isoY / 4 - 150, 50, 150);

        if ((window as any).debug) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.rect.x / 4, this.rect.y / 4, this.rect.w / 4, this.rect.h / 4);
        }
    }

    speed = .1;
    tick(dt: number) {
        const path = this.pathToPlayer;
        if (!path || path.length == 0) return;
        const dx = (this.x - 660) / 50 - path[0].x;
        const dy = (this.y - 480) / 50 - path[0].y;
        const direction = Math.atan2(-dy, dx);
        this.velocity = [-Math.cos(direction) * this.speed, Math.sin(direction) * this.speed];
        const distanceSquared = (dx * dx) + (dy * dy);
        if (distanceSquared < 1) path.shift();

        this.position[0] += this.velocity[0] * dt;
        this.position[1] += this.velocity[1] * dt;
        this.rect.x = this.x - (this.width / 2);
        this.rect.y = this.y - (this.height / 2);
    }

    closestTile() {
        const tileX = Math.round((this.x - 660) / 50);
        const tileY = Math.round((this.y - 480) / 50);
        return this.game.currentRoom?.pathing.findIndex(t => t.x == tileX && t.y == tileY) || 0;
    }

    get x() { return this.position[0] }
    get y() { return this.position[1] }
    get vx() { return this.velocity[0] }
    get vy() { return this.velocity[1] }

}

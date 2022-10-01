import Game from './Game.js';
import Rect from './Rect.js';
import Player from './Player.js';

export default class Room {
    walls: Array<Wall> = [];

    constructor(readonly game: Game) { }

    draw(ctx: CanvasRenderingContext2D) {
        this.walls.forEach(wall => wall.draw(ctx));
    }

    addWall(x: number, y: number, w: number, h: number) {
        this.walls.push(new Wall(this, x, y, w, h));
    }
}

class Wall {
    rect: Rect;
    constructor(
        readonly room: Room,
        x: number,
        y: number,
        w: number,
        h: number,
    ) {
        this.rect = new Rect(x, y, w, h);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'pink';

        const player: Player = this.room.game.actors[0] as Player;
        if (this.rect.contains(...player.position)) ctx.fillStyle = 'red';

        const { x, y, w, h } = this.rect;
        ctx.fillRect(x, y, w, h);
    }
}

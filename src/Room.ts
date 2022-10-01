import Game from './Game.js';
import Rect from './Rect.js';

export default class Room {
    walls: Array<Wall> = [];

    constructor(readonly game: Game) {
        this.generateWallsFromLayer = this.generateWallsFromLayer.bind(this);
        fetch('living-room.json').then(rsp => rsp.json())
            .then(this.generateWallsFromLayer);
    }

    generateWallsFromLayer(tiled: any) {
        const wallLayer = tiled.layers[2];
        const walls: Array<any> = wallLayer.objects;
        walls.forEach(w => this.addWall(w.x, w.y, w.width, w.height))
        console.log(this.walls)
    }

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

        const { x, y, w, h } = this.rect;
        ctx.fillRect(x / 4, y / 4, w / 4, h / 4);
    }
}

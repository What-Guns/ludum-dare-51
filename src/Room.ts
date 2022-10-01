import Game from './Game.js';
import Rect from './Rect.js';
import images from './images.js';

export default class Room {
    walls: Array<Wall> = [];
    doors: Array<Door> = [];
    tiled: any;

    constructor(readonly game: Game, readonly path: string) {
        this.generateWallsFromTiled = this.generateWallsFromTiled.bind(this);
        this.generateDoorsFromTiled = this.generateDoorsFromTiled.bind(this);
        fetch(`maps/${path}.json`).then(rsp => rsp.json())
            .then(tiled => {
                this.tiled = tiled;
                this.generateWallsFromTiled(tiled);
                this.generateDoorsFromTiled(tiled);
            });
    }

    generateWallsFromTiled(tiled: any) {
        const wallLayer = (tiled.layers as Array<any>).find(layer => layer.name === "walls");
        const walls: Array<any> = wallLayer.objects;
        walls.forEach(w => this.addWall(w.x, w.y, w.width, w.height));
    }

    generateDoorsFromTiled(tiled: any) {
        const doorLayer = (tiled.layers as Array<any>).find(layer => layer.name === "doors");
        console.log(doorLayer)
        const doors: Array<any> = doorLayer.objects;
        doors.forEach(d => this.addDoor(d.x, d.y, d.width, d.height, d.properties));
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.tiled) return;
        ctx.drawImage(this.image, 0, 0, ctx.canvas.width, ctx.canvas.height);

        if ((window as any).debug) {
            this.walls.forEach(wall => wall.draw(ctx));
            this.doors.forEach(door => door.draw(ctx));
        }
    }

    get image() {
        const imageName = (this.tiled.properties as Array<any>).find(p => p.name == "imageName").value;
        return images(imageName);
    }

    get name() {
        return (this.tiled.properties as Array<any>).find(p => p.name == "name").value;
    }

    addWall(x: number, y: number, w: number, h: number) {
        this.walls.push(new Wall(this, x, y, w, h));
    }

    addDoor(x: number, y: number, w: number, h: number, props: any) {
        this.doors.push(new Door(this, x, y, w, h, props));
    }
}

class Door {
    rect: Rect;
    constructor(
        readonly room: Room,
        x: number,
        y: number,
        w: number,
        h: number,
        readonly props: any,
    ) {
        this.rect = new Rect(x, y, w, h);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'orange';

        const { x, y, w, h } = this.rect;
        ctx.fillRect(x / 4, y / 4, w / 4, h / 4);
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

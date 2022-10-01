import Game from './Game.js';
import Rect from './Rect.js';
import images from './images.js';

export default class Room {
    walls: Array<Wall> = [];
    doors: Array<Door> = [];
    pathing: Array<Tile> = [];
    tiled: any;

    constructor(readonly game: Game, readonly path: string) {
        this.generateWallsFromTiled = this.generateWallsFromTiled.bind(this);
        this.generateDoorsFromTiled = this.generateDoorsFromTiled.bind(this);
        this.generatePathingFromTiled = this.generatePathingFromTiled.bind(this);
        fetch(`maps/${path}.json`).then(rsp => rsp.json())
            .then(tiled => {
                this.tiled = tiled;
                this.generateWallsFromTiled(tiled);
                this.generateDoorsFromTiled(tiled);
                this.generatePathingFromTiled(tiled);
            });
    }

    generatePathingFromTiled(tiled: any) {
        const pathingLayer = (tiled.layers as Array<any>).find(layer => layer.name === "pathing");
        const width = pathingLayer.width;
        (pathingLayer.data as Array<number>).forEach(
            (tile, index) => this.addPathingTile(tile, index % width, Math.floor(index / width))
        );
        this.pathing.forEach(tile => tile.populateLinks(width));
        console.log(this.pathing);
    }

    generateWallsFromTiled(tiled: any) {
        const wallLayer = (tiled.layers as Array<any>).find(layer => layer.name === "walls");
        const walls: Array<any> = wallLayer.objects;
        walls.forEach(w => this.addWall(w.x, w.y, w.width, w.height));
    }

    generateDoorsFromTiled(tiled: any) {
        const doorLayer = (tiled.layers as Array<any>).find(layer => layer.name === "doors");
        const doors: Array<any> = doorLayer.objects;
        doors.forEach(d => this.addDoor(d.x, d.y, d.width, d.height, d.properties));
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.tiled) return;
        ctx.drawImage(this.image, 0, 0, ctx.canvas.width, ctx.canvas.height);

        if ((window as any).debug) {
            this.walls.forEach(wall => wall.draw(ctx));
            this.doors.forEach(door => door.draw(ctx));
            this.pathing.forEach(tile => tile.draw(ctx));
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

    addPathingTile(tileIndex: number, x: number, y: number) {
        this.pathing.push(new Tile(this, tileIndex, x, y));
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

class Tile {
    links: Array<TileLink> = [];
    constructor(
        readonly room: Room,
        readonly tileIndex: number,
        readonly x: number,
        readonly y: number,
    ) { }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.tileIndex == 1 ? 'blue' : 'red';
        ctx.fillRect(this.x * 12.5 + 165, this.y * 12.5 + 120, 5, 5);
        this.links.forEach(l => {
            ctx.beginPath()
            ctx.moveTo(this.x * 12.5 + 165, this.y * 12.5 + 120)
            ctx.lineTo(l.tile.x * 12.5 + 165, l.tile.y * 12.5 + 120)
            ctx.stroke();
        });
    }

    populateLinks(width: number) {
        const { room, x, y } = this;
        const { pathing } = room;

        const populateLink = this.populateLink.bind(this, pathing);

        if (y > 0) {
            if (x > 0) populateLink((y - 1) * width + x - 1, 1.414)
            populateLink((y - 1) * width + x, 1)
            if (x < width - 1) populateLink((y - 1) * width + x + 1, 1.414)
        }

        if (x > 0) populateLink((y) * width + x - 1, 1)
        if (x < width - 1) populateLink((y) * width + x + 1, 1)

        if (y < pathing.length / width - 1) {
            if (x > 0) populateLink((y + 1) * width + x - 1, 1.414)
            populateLink((y + 1) * width + x, 1)
            if (x < width - 1) populateLink((y + 1) * width + x + 1, 1.414)
        }
    }

    populateLink(pathing: Array<Tile>, index: number, weight: number) {
        if (pathing[index]) this.links.push(new TileLink(pathing[index], weight));
    }
}

class TileLink {
    constructor(
        readonly tile: Tile,
        readonly weight: number,
    ) { }
}


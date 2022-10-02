import Game from './Game.js';
import Rect from './Rect.js';
import images from './images.js';
import maps from './maps.js';
import TiledMap, { TiledTileLayer, TiledObjectLayer, TiledProperty } from './Tiled.js';

export default class Room {
    walls: Array<Wall> = [];
    doors: Array<Door> = [];
    pathing: Array<Tile> = [];
    keyZones: Array<KeyZone> = [];
    tileWidth = 1;
    tiled: TiledMap;

    constructor(readonly game: Game, readonly path: string) {
        this.generateWallsFromTiled = this.generateWallsFromTiled.bind(this);
        this.generateDoorsFromTiled = this.generateDoorsFromTiled.bind(this);
        this.generatePathingFromTiled = this.generatePathingFromTiled.bind(this);
        this.generateKeyZonesFromTiled = this.generateKeyZonesFromTiled.bind(this);
        this.tiled = maps(path);
        this.generateWallsFromTiled(this.tiled);
        this.generateDoorsFromTiled(this.tiled);
        this.generatePathingFromTiled(this.tiled);
        this.generateKeyZonesFromTiled(this.tiled);
    }

    generateKeyZonesFromTiled(tiled: TiledMap) {
        const keyLayer = tiled.layers.find(layer => layer.name === "keys") as TiledObjectLayer;
        const keyZones = keyLayer.objects;
        keyZones.forEach(kz => this.addKeyZone(kz.id, kz.x, kz.y, kz.width, kz.height, kz.properties));
    }

    addKeyZone(id: number, x: number, y: number, w: number, h: number, props: Array<TiledProperty>) {
        this.keyZones.push(new KeyZone(this, id, x, y, w, h, props));

    }

    generatePathingFromTiled(tiled: TiledMap) {
        const pathingLayer = tiled.layers.find(layer => layer.name === "pathing") as TiledTileLayer;
        const width = pathingLayer.width;
        this.tileWidth = width;
        (pathingLayer.data as Array<number>).forEach(
            (tile, index) => this.addPathingTile(tile, index % width, Math.floor(index / width))
        );
        this.pathing.forEach(tile => tile.populateLinks(width));
    }

    generateWallsFromTiled(tiled: TiledMap) {
        const wallLayer = tiled.layers.find(layer => layer.name === "walls") as TiledObjectLayer;
        const walls = wallLayer.objects;
        walls.forEach(w => this.addWall(w.x, w.y, w.width, w.height));
    }

    generateDoorsFromTiled(tiled: TiledMap) {
        const doorLayer = tiled.layers.find(layer => layer.name === "doors") as TiledObjectLayer;
        const doors = doorLayer.objects;
        doors.forEach(d => this.addDoor(d.x, d.y, d.width, d.height, d.properties));
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.tiled) return;
        ctx.drawImage(this.image, 0, 0, ctx.canvas.width, ctx.canvas.height);

        if ((window as any).debug) {
            this.keyZones.forEach(kz => kz.draw(ctx));
            this.walls.forEach(wall => wall.draw(ctx));
            this.doors.forEach(door => door.draw(ctx));
            this.pathing.forEach(tile => tile.draw(ctx));
        }
    }

    get image() {
        const imageName = this.tiled.properties.find(p => p.name == "imageName")!.value as string;
        return images(imageName);
    }

    get name() {
        return this.tiled.properties.find(p => p.name == "name")!.value as string;
    }

    addWall(x: number, y: number, w: number, h: number) {
        this.walls.push(new Wall(this, x, y, w, h));
    }

    addDoor(x: number, y: number, w: number, h: number, props: Array<TiledProperty>) {
        this.doors.push(new Door(this, x, y, w, h, props));
    }

    addPathingTile(tileIndex: number, x: number, y: number) {
        this.pathing.push(new Tile(this, tileIndex, x, y));
    }

    clearPathfinding() {
        this.pathing.forEach(tile => { tile.isOnShortestPath = false; tile.visited = false; tile.from = undefined; tile.distance = Number.MAX_SAFE_INTEGER });
    }

    findPath(start: number, end: number) {
        this.clearPathfinding();
        let currentNode = this.pathing[start];
        let candidateNodes: Array<Tile> = [];
        currentNode.visited = true;
        currentNode.distance = 0;
        while (currentNode != this.pathing[end]) {
            currentNode.links.filter(link => !link.to.visited).forEach(link => {
                if (currentNode.distance + link.weight < link.to.distance) {
                    link.to.distance = currentNode.distance + link.weight;
                    link.to.from = currentNode;
                }
                link.to.distance = Math.min(currentNode.distance + link.weight, link.to.distance);
                if (!candidateNodes.includes(link.to)) candidateNodes.push(link.to);
            });
            currentNode.visited = true;
            candidateNodes.shift();
            currentNode = candidateNodes.reduce((closestUnvisited, node) => !node.visited && node.distance < closestUnvisited.distance ? node : closestUnvisited);
        }

        const shortestPath = [];
        while (currentNode != this.pathing[start]) {
            shortestPath.push(currentNode);
            currentNode.isOnShortestPath = true;
            currentNode = currentNode.from!;
        }
        return shortestPath;
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
        readonly props: Array<TiledProperty>,
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
    visited = false;
    distance = Number.MAX_SAFE_INTEGER;
    isOnShortestPath = false;
    from?: Tile;

    constructor(
        readonly room: Room,
        readonly tileIndex: number,
        readonly x: number,
        readonly y: number,
    ) { }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.isOnShortestPath ? 'yellow' : this.tileIndex == 1 ? 'blue' : 'red';
        ctx.fillRect(this.x * 12.5 + 165, this.y * 12.5 + 120, 5, 5);
        this.links.forEach(l => l.draw(ctx));
    }

    populateLinks(width: number) {
        const { room, x, y } = this;
        const { pathing } = room;

        const populateLink = this.populateLink.bind(this, pathing);

        if (y > 0) {
            if (x > 0) populateLink((y - 1) * width + x - 1, 1.414);
            populateLink((y - 1) * width + x, 1);
            if (x < width - 1) populateLink((y - 1) * width + x + 1, 1.414);
        }

        if (x > 0) populateLink((y) * width + x - 1, 1);
        if (x < width - 1) populateLink((y) * width + x + 1, 1);

        if (y < pathing.length / width - 1) {
            if (x > 0) populateLink((y + 1) * width + x - 1, 1.414);
            populateLink((y + 1) * width + x, 1);
            if (x < width - 1) populateLink((y + 1) * width + x + 1, 1.414);
        }
    }

    populateLink(pathing: Array<Tile>, index: number, weight: number) {
        if (this.tileIndex == 1 && pathing[index] && pathing[index].tileIndex == 1) this.links.push(new TileLink(this, pathing[index], weight));
    }
}

class TileLink {
    constructor(
        readonly from: Tile,
        readonly to: Tile,
        readonly weight: number,
    ) { }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = this.from.isOnShortestPath ? 'yellow' : 'black';
        ctx.beginPath()
        ctx.moveTo(this.from.x * 12.5 + 165, this.from.y * 12.5 + 120)
        ctx.lineTo(this.to.x * 12.5 + 165, this.to.y * 12.5 + 120)
        ctx.stroke();
    }
}

class KeyZone {
    rect: Rect;
    searched = false;
    constructor(
        readonly room: Room,
        readonly id: number,
        x: number,
        y: number,
        w: number,
        h: number,
        readonly props: Array<TiledProperty>,
    ) {
        this.rect = new Rect(x, y, w, h);
    }

    get message() {
        return this.props.find(p => p.name == "message")!.value as string;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'lightblue';

        const { x, y, w, h } = this.rect;
        ctx.fillRect(x / 4, y / 4, w / 4, h / 4);
    }
}


export { Tile }

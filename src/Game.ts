import Actor from './Actor.js';
import Player from './Player.js';
import Room from './Room.js';
import Enemy from './Enemy.js';

const TRANSITION_TIME = 600;
const THUNDER_TIME = 10000;
// If this variable is set to ANYTHING ELSE,
// the game no longer fits the theme!

export default class Game {
    actors: Array<Actor> = [];
    rooms: Array<Room> = [];
    currentRoom?: Room;
    timestamp = 0;
    state = GameState.RUNNING;
    destinationRoom?: Room;
    destinationPosition?: [number, number];
    transitionTimer = 0;
    thunderTimer = THUNDER_TIME;

    constructor(readonly ctx: CanvasRenderingContext2D) {
        this.run = this.run.bind(this);
        this.actors.push(new Player(this));
        this.actors.push(new Enemy(this));
        this.currentRoom = new Room(this, 'living-room');
        this.rooms.push(this.currentRoom);
        this.rooms.push(new Room(this, 'kitchen'));
        this.findPathFromEnemyToPlayer = this.findPathFromEnemyToPlayer.bind(this);
        window.addEventListener('keyup', ev => { if (ev.key === 'p') this.findPathFromEnemyToPlayer() });
    }

    findPathFromEnemyToPlayer() {
        const player = this.actors.find(actor => actor instanceof Player) as Player;
        const enemy = this.actors.find(actor => actor instanceof Enemy) as Enemy;
        enemy.pathToPlayer = this.currentRoom?.findPath(player.closestTile(), enemy.closestTile());
    }

    run(timestamp: number) {
        const dt = timestamp - this.timestamp;
        switch (this.state) {
            case GameState.LOADING:
                // noop i think
                break;
            case GameState.RUNNING:
                this.runRunning(dt);
                break;
            case GameState.ROOM_TRANSITION:
                this.runRoomTransition(dt);
                break;
        }
        this.timestamp = timestamp;

        window.requestAnimationFrame(this.run);
    }

    runRunning(dt: number) {
        this.tick(dt);
        this.draw();
    }

    runRoomTransition(dt: number) {
        this.tickTransition(dt);
        this.draw();
    }

    tickTransition(dt: number) {
        this.transitionTimer -= dt;
        if (this.transitionTimer < 0) {
            this.finishRoomTransition();
        } else if (this.transitionTimer < TRANSITION_TIME / 2) {
            const player = this.actors.find(actor => actor instanceof Player) as Player;
            player.position = this.destinationPosition!;
        }
    }

    tick(dt: number) {
        this.tickThunder(dt);
        this.actors.forEach(actor => actor.tick(dt));
    }

    tickThunder(dt: number) {
        this.thunderTimer -= dt;
        if (this.thunderTimer < 0) {
            this.thunderTimer += THUNDER_TIME;
            this.thunderclap();
        }
    }

    thunderclap() {
        console.log('Boom!');
    }

    draw() {
        const ctx = this.ctx;
        const { canvas } = ctx;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.currentRoom?.draw(ctx);
        this.actors.forEach(actor => actor.draw(ctx));

        if (this.transitionTimer > 0) {
            ctx.fillStyle = 'black';
            const alpha = ctx.globalAlpha;
            const opacity = 1 - (this.transitionTimer - (TRANSITION_TIME / 2)) / (TRANSITION_TIME / 2)
            ctx.globalAlpha = opacity
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = alpha;
        }
    }

    changeRoom(roomName: string, position: [number, number]) {
        this.destinationRoom = this.rooms.find(room => room.path == roomName);
        if (!this.destinationRoom) throw `Invalid destination ${roomName}`;

        this.destinationPosition = position;
        this.transitionTimer = TRANSITION_TIME;
        this.state = GameState.ROOM_TRANSITION;
    }

    finishRoomTransition() {
        this.destinationRoom = undefined;
        this.state = GameState.RUNNING;
        this.transitionTimer = 0;
    }

}

enum GameState {
    LOADING,
    RUNNING,
    ROOM_TRANSITION,
}

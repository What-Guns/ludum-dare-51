import Actor from './Actor.js';
import Player from './Player.js';
import Room from './Room.js';

const TRANSITION_TIME = 600;

export default class Game {
    actors: Array<Actor> = [];
    rooms: Array<Room> = [];
    currentRoom?: Room;
    timestamp = 0;
    state = GameState.RUNNING;
    destinationRoom?: Room;
    transitionTimer = 0;

    constructor(readonly ctx: CanvasRenderingContext2D) {
        this.run = this.run.bind(this);
        this.actors.push(new Player(this));
        this.currentRoom = new Room(this, 'living-room');
        this.rooms.push(this.currentRoom);
        this.rooms.push(new Room(this, 'kitchen'));
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
        }
    }

    tick(dt: number) {
        this.actors.forEach(actor => actor.tick(dt));
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
            console.log(opacity)
            ctx.globalAlpha = opacity
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = alpha;
        }
    }

    changeRoom(roomName: string) {
        this.destinationRoom = this.rooms.find(room => room.path == roomName);
        if (!this.destinationRoom) throw `Invalid destination ${roomName}`;

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

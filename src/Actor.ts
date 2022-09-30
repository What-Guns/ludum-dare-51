export default interface Actor {
    draw(ctx: CanvasRenderingContext2D): void;
    tick(dt: number): void;
}

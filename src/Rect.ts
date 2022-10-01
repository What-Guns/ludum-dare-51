export default class Rect {
    constructor(
        public x: number,
        public y: number,
        public w: number,
        public h: number,
    ) { }

    collides(other: Rect) {
        const { x, y, w, h } = this;
        return this.contains(other.x, other.y) || this.contains(other.x + other.h, other.y)
            || this.contains(other.x, other.y + other.h) || this.contains(other.x + other.w, other.y + other.h)
            || other.contains(x, y) || other.contains(x + w, y) || other.contains(x, y + h) || other.contains(x + w, y + h);

    }

    contains(x: number, y: number) {
        return x > this.x && x < (this.x + this.w) && y > this.y && y < (this.y + this.h);
    }
}

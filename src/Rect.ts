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

    collisionDirections(other: Rect) {
        return [
            this.collidesUp(other),
            this.collidesDown(other),
            this.collidesLeft(other),
            this.collidesRight(other),
        ];
    }


    collidesUp(other: Rect) {
        return other.contains(this.x, this.y) && other.contains(this.x + this.w, this.y);
    }

    collidesDown(other: Rect) {
        return other.contains(this.x, this.y + this.h) && other.contains(this.x + this.w, this.y + this.h);
    }

    collidesLeft(other: Rect) {
        return other.contains(this.x, this.y) && other.contains(this.x, this.y + this.h);
    }

    collidesRight(other: Rect) {
        return other.contains(this.x + this.h, this.y) && other.contains(this.x + this.h, this.y + this.h);
    }

    contains(x: number, y: number) {
        return x > this.x && x < (this.x + this.w) && y > this.y && y < (this.y + this.h);
    }

    get center() {
        return [this.x + (this.w / 2), this.y + (this.h / 2)];
    }
}

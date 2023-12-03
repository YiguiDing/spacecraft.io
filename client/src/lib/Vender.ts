interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Vector {
  constructor(public x: number, public y: number) {}
  cp() {
    return new Vector(this.x, this.y);
  }
  mul(factor: number) {
    this.x *= factor;
    this.y *= factor;
    return this;
  }
  mulNew(factor: number) {
    return new Vector(this.x * factor, this.y * factor);
  }
  add(vec: Vector) {
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }
  addNew(vec: Vector) {
    return new Vector(this.x + vec.x, this.y + vec.y);
  }
  sub(vec: Vector) {
    this.x -= vec.x;
    this.y -= vec.y;
    return this;
  }
  subNew(vec: Vector) {
    return new Vector(this.x - vec.x, this.y - vec.y);
  }
  rotate(angle: number) {
    const x = this.x;
    const y = this.y;
    this.x = x * Math.cos(angle) - Math.sin(angle) * y;
    this.y = x * Math.sin(angle) + Math.cos(angle) * y;
    return this;
  }
  rotateNew(angle: number) {
    return this.cp().rotate(angle);
  }
  setAngle(angle: number) {
    const l = this.len();
    this.x = Math.cos(angle) * l;
    this.y = Math.sin(angle) * l;
    return this;
  }
  setAngleNew(angle: number) {
    return this.cp().setAngle(angle);
  }
  setLength(length: number) {
    const L = this.len();
    if (L) this.mul(length / L);
    else this.x = this.y = length;
    return this;
  }
  setLengthNew(length: number) {
    return this.cp().setLength(length);
  }
  normalize() {
    const l = this.len();
    this.x /= l;
    this.y /= l;
    return this;
  }
  normalizeNew() {
    return this.cp().normalize();
  }
  angle() {
    // Returns the angle (in radians) from the X axis to a point.
    return Math.atan2(this.y, this.x);
  }
  collidesWith(rect: Rect) {
    return (
      this.x > rect.x &&
      this.y > rect.y &&
      this.x < rect.x + rect.width &&
      this.y < rect.y + rect.height
    );
  }
  len() {
    const l = Math.sqrt(this.x * this.x + this.y * this.y);
    if (l < 0.005 && l > -0.005) return 0;
    return l;
  }
  is(test: any) {
    return test instanceof Vector && this.x === test.x && this.y === test.y;
  }
  toString() {
    return `[Vector(x:${this.x},y:${
      this.y
    },angle:${this.angle()},len:${this.len()}]`;
  }
  serializer() {
    return { x: this.x.toFixed(2), y: this.y.toFixed(2) };
  }
  unSerializer({ x, y }: { x: string; y: string }) {
    this.x = +x;
    this.y = +y;
  }
}

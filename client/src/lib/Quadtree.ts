// 四叉树
export class QuadTree<T extends QuadTreeElementType> {
  dates: Set<T> = new Set();
  maxChildren;
  maxChildren_default = 4;
  hasSubTree = false;
  topLeft!: QuadTree<T>;
  topRight!: QuadTree<T>;
  bottomLeft!: QuadTree<T>;
  bottomRight!: QuadTree<T>;
  constructor(private boundary: React, maxChildren?: number) {
    this.boundary = boundary;
    this.maxChildren = maxChildren ? maxChildren : this.maxChildren_default;
  }
  addAll(items: Array<T> | IterableIterator<T>) {
    for (const item of items) {
      this.add(item);
    }
    return this;
  }
  add(item: T, position?: Point): QuadTree<T> | null {
    if (position == undefined) {
      let centerX = item.getCenterX();
      let CenterY = item.getCenterY();
      position = new Point(centerX, CenterY);
    }
    if (this.boundary.containPoint(position)) {
      if (this.dates.size < this.maxChildren) {
        this.dates.add(item);
        return this;
      } else {
        if (!this.hasSubTree) this.initSubTree();
        this.topLeft.add(item, position) ||
          this.topRight.add(item, position) ||
          this.bottomLeft.add(item, position) ||
          this.bottomRight.add(item, position);
        return this;
      }
    } else return null;
  }
  find(
    boundary: React | Cycle,
    filter?: (item: T) => boolean,
    result?: Array<T>
  ): Array<T> {
    if (result == undefined) result = [];
    if (this.boundary.collision(boundary)) {
      if (!filter) result.push(...this.dates);
      else {
        for (let item of this.dates) {
          if (filter(item)) result.push(item);
        }
      }
      if (this.hasSubTree) {
        this.topLeft.find(boundary, filter, result);
        this.topRight.find(boundary, filter, result);
        this.bottomLeft.find(boundary, filter, result);
        this.bottomRight.find(boundary, filter, result);
      }
    }
    return result;
  }
  remove(item: T, position?: Point): boolean {
    if (position == undefined) {
      let centerX = item.getCenterX();
      let CenterY = item.getCenterY();
      position = new Point(centerX, CenterY);
    }
    if (this.boundary.containPoint(position)) {
      if (this.dates.has(item)) {
        return this.dates.delete(item);
      } else {
        if (this.hasSubTree)
          return (
            this.topLeft.remove(item, position) ||
            this.topRight.remove(item, position) ||
            this.bottomLeft.remove(item, position) ||
            this.bottomRight.remove(item, position)
          );
      }
    }
    return false;
  }
  initSubTree() {
    this.hasSubTree = true;

    this.topLeft = new QuadTree(
      new React(
        this.boundary.centerX - this.boundary.width / 4,
        this.boundary.centerY - this.boundary.height / 4,
        this.boundary.width / 2,
        this.boundary.height / 2
      )
    );
    this.topRight = new QuadTree(
      new React(
        this.boundary.centerX + this.boundary.width / 4,
        this.boundary.centerY - this.boundary.height / 4,
        this.boundary.width / 2,
        this.boundary.height / 2
      )
    );
    this.bottomLeft = new QuadTree(
      new React(
        this.boundary.centerX - this.boundary.width / 4,
        this.boundary.centerY + this.boundary.height / 4,
        this.boundary.width / 2,
        this.boundary.height / 2
      )
    );
    this.bottomRight = new QuadTree(
      new React(
        this.boundary.centerX + this.boundary.width / 4,
        this.boundary.centerY + this.boundary.height / 4,
        this.boundary.width / 2,
        this.boundary.height / 2
      )
    );
  }
  draw(context: CanvasRenderingContext2D) {
    this.boundary.draw_for_test(context);
    if (this.hasSubTree) {
      this.topLeft.draw(context);
      this.topRight.draw(context);
      this.bottomLeft.draw(context);
      this.bottomRight.draw(context);
    }
  }
}

export class React {
  constructor(
    public centerX: number, // centerX
    public centerY: number, // centerY
    public width: number,
    public height: number
  ) {}
  containPoint(point: Point) {
    return (
      this.centerX - this.width / 2 <= point.centerX &&
      point.centerX <= this.centerX + this.width / 2 &&
      this.centerY - this.height / 2 <= point.centerY &&
      point.centerY <= this.centerY + this.height / 2
    );
  }
  collision(target: React | Cycle): boolean {
    if (target instanceof React) {
      return this.collisionReact(target);
    } else if (target instanceof Cycle) {
      return this.collisionCycle(target);
    } else return false;
  }
  collisionReact(react: React) {
    return !(
      this.centerX + this.width / 2 < react.centerX - react.width / 2 ||
      this.centerX - this.width / 2 > react.centerX + react.width / 2 ||
      this.centerY + this.height / 2 < react.centerY - react.height / 2 ||
      this.centerY - this.height / 2 > react.centerY + react.height / 2
    );
  }
  collisionCycle(cycle: Cycle) {
    let react_big = new React(
      this.centerX,
      this.centerY,
      this.width + 2 * cycle.radius,
      this.height + 2 * cycle.radius
    );
    let point = new Point(cycle.centerX, cycle.centerY);
    return react_big.containPoint(point);
  }
  draw_for_test(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.rect(
      this.centerX - this.width / 2,
      this.centerY - this.height / 2,
      this.width,
      this.height
    );
    context.stroke();
  }
}
export class Point {
  constructor(
    public centerX: number, // centerX
    public centerY: number // centerY
  ) {}
}
export class Cycle {
  constructor(
    public centerX: number, // centerX
    public centerY: number, // centerY
    public radius: number // radius
  ) {}
  collision(target: Cycle | React): boolean {
    if (target instanceof Cycle) {
      return this.collisionCycle(target);
    } else if (target instanceof React) {
      return this.collisionReact(target);
    } else return false;
  }
  collisionCycle(cycle: Cycle) {
    let dx = this.centerX - cycle.centerX;
    let dy = this.centerY - cycle.centerY;
    let differ = Math.sqrt(dx * dx + dy * dy);
    return this.radius + cycle.radius > differ;
  }
  collisionReact(react: React) {
    return react.collision(this);
  }
}
export interface QuadTreeElementType {
  getCenterX(): number;
  getCenterY(): number;
}
export interface CollisionCheckable {
  getArea(): React | Cycle;
}

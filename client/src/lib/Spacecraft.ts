import { Game } from "./Game";
import { Vector } from "./Vender";
import { Action, Actions } from "./InputListener";
import {
  bound,
  drawBezierLine,
  drawPolygon,
  radians,
  random_flo,
  random_pick,
  unbound,
} from "./utils";
import { React } from "./Quadtree";
import { Player, Bullet, Particle, ParticleManager } from "./Player";

export class Spacecraft implements Player {
  bloods = 10;
  pos = new Vector(100, 100); // 位置
  vel = new Vector(0, 0); // 矢量速度
  dir = new Vector(random_flo(-1, 1), random_flo(-1, 1)).normalize(); // 方向
  movAcc1Speed = 300; // 普通移动加速度
  movAcc2Speed = 600; // 加速移动加速度
  movMaxSpeed = 1200; // 最大速度
  movDecSpeed = 0.96; // 移动速度的衰减
  rotSpeed = 0; // 旋转速度
  rotAccSpeed = 180; // 旋转加速度
  rotMaxSpeed = 365; // 旋转最大速度
  rotDecSpeed = 0.95; // 旋转速度的衰减
  fillStyle = random_pick(["gray", "white"]);
  strokeStyle = random_pick(["black"]);
  height = 20; // 宽
  width = 30; // 高
  particle: ParticleManager = new Spacecrift_ParticleManger(this);
  weapon: Spacecrift_WeaponManager = new Spacecrift_WeaponManager(this);
  constructor(pos: Vector | null, public uid: string, public uname: string) {
    if (pos) this.pos = pos;
  }
  update(game: Game, input: Actions, dt: number) {
    this.movementUpdate(game, input, dt);
    this.weapon.update(game, this, input, dt);
    this.particle.update(game, this, input, dt);
  }
  draw(ctx: CanvasRenderingContext2D) {
    this.particle.draw(ctx);
    this.weapon.draw(ctx);
    this.texture(ctx);
  }
  movementUpdate(game: Game, input: Actions, dt: number) {
    // 向前移动
    if (input.includes(Action.MoveOn)) {
      if (input.includes(Action.SpeedUp)) {
        this.vel.add(this.dir.mulNew(this.movAcc2Speed * dt)); // 加速移动
      } else {
        this.vel.add(this.dir.mulNew(this.movAcc1Speed * dt)); // 普通移动
      }
    } else {
      this.vel.mul(this.movDecSpeed); // 速度衰减
    }
    // 转弯
    if (input.includes(Action.TurnLeft)) {
      this.rotSpeed -= this.rotAccSpeed * dt; // 左旋
    } else if (input.includes(Action.TurnRight)) {
      this.rotSpeed += this.rotAccSpeed * dt; // 右旋
    } else {
      this.rotSpeed *= this.rotDecSpeed; // 衰减
    }

    // 限制移动速度
    this.vel.setLength(bound(0, this.vel.len(), this.movMaxSpeed));
    // 限制旋转速度
    this.rotSpeed = bound(-this.rotMaxSpeed, this.rotSpeed, this.rotMaxSpeed);

    // 根据移动速度计算位置
    this.pos.add(this.vel.mulNew(dt));
    // 计算旋转速度计算方向
    this.dir.rotate(radians(this.rotSpeed * dt));

    // 不穿墙
    // this.pos.x = bound(0, this.pos.x, game.width);
    // this.pos.y = bound(0, this.pos.y, game.height);
    // 穿墙
    this.pos.x = unbound(0, this.pos.x, game.width);
    this.pos.y = unbound(0, this.pos.y, game.height);
  }
  texture(ctx: CanvasRenderingContext2D) {
    let unit = this.width / 3;
    let fill = this.fillStyle;
    let strk = this.strokeStyle;
    ctx.save();
    // 使用相对玩家中心的坐标
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.dir.angle());
    // 引擎部分，矩形坐标
    drawPolygon(
      ctx,
      [
        [-2.5 * unit, -0.5 * unit],
        [-2.5 * unit, +0.5 * unit],
        [-2.0 * unit, +0.25 * unit],
        [-2.0 * unit, -0.25 * unit],
      ],
      fill,
      strk
    );
    // 机翼部分，矩形坐标
    drawPolygon(
      ctx,
      [
        [-1.5 * unit, -3.0 * unit],
        [-1.5 * unit, +3.0 * unit],
        [-0.5 * unit, +3.0 * unit],
        [+0.5 * unit, +1.0 * unit],
        [+0.5 * unit, -1.0 * unit],
        [-0.5 * unit, -3.0 * unit],
      ],
      fill,
      strk
    );
    // 机翼部分，矩形坐标
    drawPolygon(
      ctx,
      [
        [-1.5 * unit, -2.5 * unit],
        [-1.5 * unit, -1.5 * unit],
        [-1.0 * unit, -1.5 * unit],
        [-1.0 * unit, -2.5 * unit],
      ],
      fill,
      strk
    );
    drawPolygon(
      ctx,
      [
        [-1.5 * unit, +2.5 * unit],
        [-1.5 * unit, +1.5 * unit],
        [-1.0 * unit, +1.5 * unit],
        [-1.0 * unit, +2.5 * unit],
      ],
      fill,
      strk
    );
    // 驾驶舱部分，矩形坐标
    drawPolygon(
      ctx,
      [
        [+2.0 * unit, -1.0 * unit],
        [+2.0 * unit, +1.0 * unit],
        [+3.0 * unit, +0.5 * unit],
        [+3.0 * unit, -0.5 * unit],
      ],
      fill,
      strk
    );
    // 驾驶舱部分，贝塞尔曲线
    ctx.beginPath();
    drawBezierLine(
      ctx,
      [+3 * unit, -0.5 * unit],
      [+3 * unit, +0.5 * unit],
      [+4 * unit, +0.0 * unit]
    );
    ctx.closePath();
    strk && (ctx.strokeStyle = strk) && ctx.stroke();
    fill && (ctx.fillStyle = fill) && ctx.fill();

    // 主体部分，矩形坐标
    drawPolygon(
      ctx,
      [
        [-2 * unit, -1 * unit],
        [+2 * unit, -1 * unit],
        [+2 * unit, +1 * unit],
        [-2 * unit, +1 * unit],
      ],
      fill,
      strk
    );
    // 机翼部分，矩形坐标
    drawPolygon(
      ctx,
      [
        [-2.0 * unit, -0.1 * unit],
        [-2.0 * unit, +0.1 * unit],
        [+0.5 * unit, +0.1 * unit],
        [+0.5 * unit, -0.1 * unit],
      ],
      fill,
      strk
    );
    ctx.restore();
  }
  getCenterX(): number {
    return this.pos.x;
  }
  getCenterY(): number {
    return this.pos.y;
  }
  getArea(): React {
    return new React(this.pos.x, this.pos.y, this.height, this.width);
  }
}

export class MissileBullet implements Bullet {
  initSpeed = 100; // 初速度
  accSpeed = 500; // 加速度
  maxSpeed = 1000; // 最大速度
  width = 8; // 宽
  height = 4; // 高
  fillStyle = "white";
  strokeStyle = "black";
  hitted = false; // 是否击中
  public creatTime: number;
  constructor(
    public pos: Vector, // 位置
    public dir: Vector, // 方向
    public vel: Vector // 速度
  ) {
    this.maxSpeed += vel.len();
    this.creatTime = Date.now();
  }
  update(game: Game, player: Player, input: Actions, dt: number) {
    // 计算速度
    this.vel.add(this.dir.mulNew(this.accSpeed * dt));
    // 限制速度
    this.vel.setLength(bound(this.initSpeed, this.vel.len(), this.maxSpeed));
    // 计算位置
    this.pos.add(this.vel.mulNew(dt));
    // // 限制位置
    // this.pos.x = bound(-10, this.pos.x, game.width + 10);
    // this.pos.y = bound(-10, this.pos.y, game.height + 10);
    // 不限制限制位置
    this.pos.x = unbound(0, this.pos.x, game.width);
    this.pos.y = unbound(0, this.pos.y, game.height);
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.strokeStyle = this.strokeStyle;
    ctx.fillStyle = this.fillStyle;

    // 移动到子弹中心
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.dir.angle());
    // 子弹实体矩形区域
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    // 子弹头处圆形
    ctx.fillStyle = this.fillStyle;
    ctx.strokeStyle = this.strokeStyle;
    // 贝塞尔曲线
    drawBezierLine(
      ctx,
      [+this.width / 2, -this.height / 2],
      [+this.width / 2, +this.height / 2],
      [+this.width / 2 + 2 * this.height, 0]
    );
    ctx.fill();
    ctx.stroke();

    // 移动到子弹尾部
    ctx.translate(-this.width / 2, 0);
    let r = this.height / 2;

    for (let idx = 0; idx < 10; idx++) {
      // 子弹尾部处的闪光
      ctx.beginPath();
      ctx.arc(
        random_flo(-2 * r, 0),
        random_flo(-1, 1),
        random_flo(0, 1.1 * r),
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "rgba(255,0,0,0.5)";
      ctx.fill();
    }
    for (let idx = 0; idx < 5; idx++) {
      // 子弹尾部处圆形
      ctx.beginPath();
      ctx.arc(
        random_flo(-r, 0),
        random_flo(-1, 1),
        random_flo(0, r),
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "rgba(255,255,0,0.5)";
      ctx.fill();
    }
    ctx.restore();
  }
  getCenterX(): number {
    return this.pos.x;
  }
  getCenterY(): number {
    return this.pos.y;
  }
  getArea(): React {
    return new React(this.pos.x, this.pos.y, this.width, this.height);
  }
}
// 子弹
class Spacecrift_WeaponManager {
  lastFiredTime = 0; // 上次开火时间
  fireInterval = 500; // 开火间隔
  keepAlive = 3000; // 子弹存活周期
  bullets: Array<Bullet> = [];
  maxLength = 10;
  constructor(private self: Spacecraft) {}
  update(game: Game, player: Player, input: Actions, dt: number) {
    let now = Date.now();
    // 限制开火间隔
    if (
      input.includes(Action.Fire) &&
      this.lastFiredTime + this.fireInterval < now
    ) {
      let unit = this.self.width / 3;
      let pos = player.pos.cp();
      let dir = player.dir.cp();
      let vel = player.vel.cp();
      let oft = new Vector(-1 * unit, random_pick([+2 * unit, -2 * unit]));
      // 根据偏移量计算真实位置
      pos.add(oft.rotateNew(dir.angle()));
      this.bullets.push(new MissileBullet(pos, dir, vel));
      this.lastFiredTime = now;
    }
    // 限制子弹数量
    this.bullets.length = Math.min(this.bullets.length, this.maxLength);

    this.bullets = this.bullets.filter(
      (item) =>
        // 移除存在时间超时的子弹
        item.creatTime + this.keepAlive > now &&
        // 移除已经击中目标的子弹
        !item.hitted
    );
    // 刷新
    this.bullets.forEach((bullet) => bullet.update(game, player, input, dt));
  }
  draw(ctx: CanvasRenderingContext2D) {
    this.bullets.forEach((bullet) => bullet.draw(ctx));
  }
}
// 火焰
class Spacecrift_ParticleManger {
  particles: Array<Particle> = [];
  // 火焰
  flamesScare: 0 | 1 | 2 = 0;
  constructor(private self: Player) {}
  update(game: Game, self: Player, input: Actions, dt: number) {
    if (input.includes(Action.MoveOn)) {
      this.flamesScare = 1;
      if (input.includes(Action.SpeedUp)) {
        this.flamesScare = 2;
      }
    } else {
      this.flamesScare = 0;
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (this.flamesScare == 0) return;
    ctx.save();
    // 移动到飞船中心
    ctx.translate(this.self.pos.x, this.self.pos.y);
    ctx.rotate(this.self.dir.angle());
    let unit = this.self.width / 3;
    let r = unit;
    // 移动到飞船尾部
    ctx.translate(-2.5 * unit, 0);
    let factor = this.flamesScare;
    for (let idx = 0; idx < 5; idx++) {
      // 蓝色火焰
      ctx.beginPath();
      ctx.arc(
        random_flo(-0.5 * r, 0),
        random_flo(-1, 1),
        random_flo(0, 0.3 * r * factor),
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "rgba(0,191,255,0.3)";
      ctx.fill();
      // 橘黄色火焰
      ctx.beginPath();
      ctx.arc(
        random_flo(-r, 0),
        random_flo(-1, 1),
        random_flo(0, 0.5 * r * factor),
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "rgba(255,255,0,0.3)";
      ctx.fill();
      // 红色火焰
      ctx.beginPath();
      ctx.arc(
        random_flo(-1.5 * r, 0),
        random_flo(-1, 1),
        random_flo(0, 0.6 * r * factor),
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "rgba(255,0,0,0.3)";
      ctx.fill();
    }
    ctx.restore();
  }
}

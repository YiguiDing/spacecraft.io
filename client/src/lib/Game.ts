import { Net } from "./Net";
import { bound, getUid, random_int } from "./utils";
import { Config } from "./Config";
import { Background } from "./Background";
import { Player } from "./Player";
import { Spacecraft } from "./Spacecraft";
import { InputListener } from "./InputListener";
import { PageAnimation } from "./PageAnimation";
import { ParticleManager } from "./ParticleManager";
import { CollisionDetecter } from "./CollisionDetecter";
import { Vector } from "./Vender";
import Stats from "stats.js";

export class Game {
  config = new Config();
  self!: Player;
  others: Map<string, Player> = new Map();
  input = new InputListener();
  network = new Net(this, this.input);
  collision = new CollisionDetecter(this);
  particle = new ParticleManager(this);
  pageAni = new PageAnimation(this);
  background!: Background;
  width = 1920 * 20;
  height = 960 * 20;
  viewPos = { x: 0, y: 0 };
  private _viewWidth = 1920;
  private _viewHeight = 960;
  camera = new Camera(this);
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  timer: any = 0;
  stats = new Stats();
  constructor(canvas: HTMLCanvasElement, config?: Config) {
    config && (this.config = config);
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d")!;
    this.canvas.width = this.viewWidth;
    this.canvas.height = this.viewHeight;
    this.background = new Background(this);
    this.stats.showPanel(0);
    this.stats.dom.style.left = "unset";
    this.stats.dom.style.right = "0px";
  }
  update(dt: number) {
    this.camera.update(dt);
    if (this.config.onlineMode) {
      this.background.update(dt);
    }
    this.self.update(this, this.input.inputs, dt);
    this.others.forEach((item, uid) => {
      item.update(this, this.network.inputs.get(uid) || [], dt);
    });
    this.collision.update();
    this.particle.update(dt);
    this.pageAni.update();
    this.network.onGameUpdate();
  }
  draw() {
    this.ctx.save();
    // 清屏
    this.ctx.clearRect(
      0,
      0,
      this.width + this.viewWidth,
      this.height + this.viewHeight
    );
    // 底色
    if (this.config.onlineMode) {
      this.ctx.fillStyle = "rgba(0,5,24,1)";
      this.ctx.fillRect(
        0,
        0,
        this.width + this.viewWidth,
        this.height + this.viewHeight
      );
    }
    // 调整视口至玩家所在区域
    this.camera.translate(this.ctx);
    // 背景色
    if (this.config.onlineMode) {
      this.background?.draw(this.ctx);
    }
    // 边界
    this.ctx.save();
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 5;
    this.ctx.strokeRect(0, 0, this.width, this.height);
    this.ctx.restore();
    // 玩家
    this.self.draw(this.ctx);
    this.others.forEach((item) => item.draw(this.ctx));
    this.particle.draw(this.ctx);
    this.ctx.restore();
  }
  rePlay() {
    let pos = new Vector(
      // 初始出生点都在第一个视口
      random_int(0, this.viewWidth),
      random_int(0, this.viewHeight)
    );
    this.self = new Spacecraft(pos, getUid(), this.config.userName);
    this.network.onRePlay();
  }
  async run() {
    this.rePlay();
    document.body.appendChild(this.stats.dom);
    let t1 = Date.now();
    let t2 = Date.now();
    let animate = () => {
      t2 = Date.now();
      let dt = (t2 - t1) / 1000;
      this.stats.begin();
      this.update(dt);
      this.draw();
      this.stats.end();
      t1 = t2;
      this.timer = requestAnimationFrame(animate);
    };
    this.timer = requestAnimationFrame(animate);
    this.input.listen();
    if (this.config.onlineMode) {
      this.network.run();
    }
  }
  destory() {
    document.body.removeChild(this.stats.dom);
    cancelAnimationFrame(this.timer);
    this.input.destory();
    this.network.destory();
  }

  public get viewWidth(): number {
    return this._viewWidth;
  }
  public get viewHeight(): number {
    return this._viewHeight;
  }
  public set viewWidth(val: number) {
    this.canvas.width = val;
    this._viewWidth = val;
  }
  public set viewHeight(val: number) {
    this.canvas.height = val;
    this._viewHeight = val;
  }
}

class Camera {
  constructor(public game: Game) {}
  update(dt: number) {
    // 视口跟随玩家位置
    let vpcx = this.game.viewPos.x + this.game.viewWidth / 2;
    let vpcy = this.game.viewPos.y + this.game.viewHeight / 2;
    let lenw = this.game.self.pos.x - vpcx;
    let lenh = this.game.self.pos.y - vpcy;
    let dx = 2 * lenw * dt;
    let dy = 4 * lenh * dt;
    this.game.viewPos.x += dx;
    this.game.viewPos.y += dy;
    // 限制视口紧随玩家
    this.game.viewPos.x = bound(
      this.game.self.pos.x - this.game.viewWidth,
      this.game.viewPos.x,
      this.game.self.pos.x + this.game.viewWidth
    );
    this.game.viewPos.y = bound(
      this.game.self.pos.y - this.game.viewHeight,
      this.game.viewPos.y,
      this.game.self.pos.y + this.game.viewHeight
    );
  }
  translate(ctx: CanvasRenderingContext2D) {
    // 调整视口
    ctx.translate(-this.game.viewPos.x, -this.game.viewPos.y);
  }
}

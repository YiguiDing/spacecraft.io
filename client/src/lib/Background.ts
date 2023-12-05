import { Game } from "./Game";
import { Cycle, React } from "./Quadtree";
import { Vector } from "./Vender";
import { bound, radians, random_flo, random_int } from "./utils";

export class Background {
  stars: Array<Star> = [];
  meteors: Array<Meteor> = [];
  meteorTimer = Date.now();
  meteorIntevol = 4000;
  meteorkeepAlive = 10000;
  constructor(private game: Game) {
    this.initStars();
  }
  initStars() {
    let num = this.game.width * this.game.height * 0.0001;
    for (let i = 0; i < num; i++) {
      let x = random_int(0, this.game.width);
      let y = random_int(0, this.game.height);
      let r = random_flo(0, 1.5);
      let a = random_flo(0, 1);
      this.stars.push(new Star(x, y, r, a));
    }
  }
  addMeteor(dt: number) {
    let now = Date.now();
    // 定时生成流星
    if (this.meteorTimer + this.meteorIntevol < now) {
      this.meteorTimer = now;
      let pos = new Vector(
        // 只在视口区域生成
        random_int(this.game.viewPos.x, this.game.viewWidth),
        random_int(this.game.viewPos.y, this.game.viewHeight)
      );
      this.meteors.push(new Meteor(pos));
    }
    this.meteors = this.meteors.filter(
      (meteor) => meteor.creatTime + this.meteorkeepAlive > now
    );
  }
  update(dt: number) {
    this.addMeteor(dt);
    this.stars.forEach((star) => star.update(dt));
    this.meteors.forEach((meteor) => meteor.update(dt));
  }
  draw(ctx: CanvasRenderingContext2D) {
    let vcx = this.game.viewPos.x + this.game.viewWidth / 2;
    let vcy = this.game.viewPos.y + this.game.viewHeight / 2;
    let vcw = this.game.viewWidth;
    let vch = this.game.viewHeight;
    let vReact = new React(vcx, vcy, vcw, vch);
    ctx.save();
    // 绘制背景色
    ctx.fillStyle = "rgba(0,5,24,1)";
    ctx.fillRect(0, 0, this.game.width, this.game.height);
    // 绘制星星
    this.stars.forEach((star) => {
      // 只绘制视口内的星星
      if (vReact.collision(star.cycle)) {
        star.draw(ctx);
      }
    });
    // 绘制流星
    this.meteors.forEach((meteor) => meteor.draw(ctx));
    ctx.restore();
  }
}
class Star {
  deg = random_int(0, 360);
  degSpeed = random_int(-90, 90);
  cycle: Cycle;
  constructor(x: number, y: number, r: number, private a: number) {
    this.cycle = new Cycle(x, y, r);
  }
  update(dt: number) {
    this.deg += this.degSpeed * dt;
    this.deg %= 360;
    // 重新映射：[-1,1] => [0,1]
    this.a = (Math.sin(radians(this.deg)) + 1) / 2;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cycle.centerX, this.cycle.centerY, this.a, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255,255,255,${this.a})`;
    ctx.fill();
    ctx.restore();
  }
}

class Meteor {
  dir = new Vector(random_flo(-1, 1), random_flo(-1, 1)).normalize();
  speed = random_flo(350, 500);
  width = random_flo(0, 1);
  height = random_int(50, 200);
  alpha = random_flo(0, 1);
  creatTime = Date.now();
  constructor(public pos: Vector) {}
  update(dt: number) {
    this.pos.add(this.dir.mulNew(this.speed * dt));
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = this.width;
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.dir.angle());
    //创建横向渐变颜色,起点坐标至终点坐标
    var line = ctx.createLinearGradient(
      -this.width / 2,
      0,
      -this.height / 2,
      0
    );
    //分段设置颜色
    line.addColorStop(0, "rgba(255, 255, 255, 1)");
    line.addColorStop(1, "rgba(255, 255,255 , 0)");
    //填充
    ctx.strokeStyle = line;
    ctx.moveTo(-this.width / 2, 0);
    ctx.lineTo(-this.height / 2, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

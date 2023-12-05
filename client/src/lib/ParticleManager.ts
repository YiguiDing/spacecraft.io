import { Game } from "./Game";
import { Particle } from "./Player";
import { Vector } from "./Vender";
import { random_flo, random_pick } from "./utils";

export interface ParticleData {
  pos: Vector;
  dir: Vector;
  length: number;
  speed: number;
  strokeStyle: string;
  creatTime: number;
}
export class ParticleManager {
  particles: Array<ParticleData> = [];
  keepAlive = 3000;
  particleTotal = 20;
  constructor(public game: Game) {}
  addParticles(pos: Vector, dir: Vector, total?: number) {
    for (let index = 0; index < (total || this.particleTotal); index++) {
      this.particles.push({
        pos: pos.cp(),
        dir: new Vector(random_flo(-1, 1), random_flo(-1, 1)).add(
          dir.normalizeNew()
        ),
        length: random_flo(1, 5),
        speed: random_flo(300, 500),
        strokeStyle: random_pick(["red", "orange", "pink", "white", "black"]),
        creatTime: Date.now(),
      });
    }
  }
  update(dt: number) {
    const now = Date.now();
    this.particles.forEach((particle) => {
      particle.pos.add(particle.dir.mulNew(particle.speed * dt));
      particle.speed *= 0.98;
    });
    this.particles = this.particles.filter(
      (particle) => particle.creatTime + this.keepAlive > now
    );
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.particles.forEach((particle) => {
      ctx.strokeStyle = particle.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(particle.pos.x, particle.pos.y);
      ctx.lineTo(
        particle.pos.x + particle.dir.x * particle.length,
        particle.pos.y + particle.dir.y * particle.length
      );
      ctx.closePath();
      ctx.stroke();
    });
    ctx.restore();
  }
}

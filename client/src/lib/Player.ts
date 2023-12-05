import { Game } from "./Game";
import { Vector } from "./Vender";
import { Actions } from "./InputListener";
import { QuadTreeElementType, CollisionCheckable } from "./Quadtree";

export interface Player extends QuadTreeElementType, CollisionCheckable {
  uid: string;
  uname: string;
  bloods: number; // 血量
  pos: Vector; // 位置
  dir: Vector; // 方向
  vel: Vector; // 速度
  height: number; // 宽
  width: number; // 高
  fillStyle: string;
  strokeStyle: string;
  weapon: WeaponManager;
  particle: ParticleManager;
  update(game: Game, input: Actions, dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}
export interface WeaponManager {
  bullets: Array<Bullet>;
  update(game: Game, player: Player, input: Actions, dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}
export interface ParticleManager {
  particles: Array<Particle>;
  update(game: Game, player: Player, input: Actions, dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}
export interface Bullet extends QuadTreeElementType, CollisionCheckable {
  pos: Vector; // 位置
  dir: Vector; // 方向
  vel: Vector; // 速度
  width: number; // 宽
  height: number; // 高
  hitted: boolean;
  creatTime: number;
  update(game: Game, player: Player, input: Actions, dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}
export interface Particle {
  update(game: Game, player: Player, input: Actions, dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

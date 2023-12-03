import { Game } from "./Game";
import { Vector } from "./Vender";
import { Spacecraft } from "./Spacecraft";
import { React, QuadTree } from "./Quadtree";

export interface Collision {
  hitted_id: string;
  bullet: {
    pos: Vector;
    dir: Vector;
  };
}
export class CollisionDetecter {
  collisionCheckResult: Array<Collision> = [];
  constructor(private game: Game) {}
  update() {
    this.check();
    this.process();
  }
  // 碰撞检测
  check() {
    let boundary = new React(
      this.game.width / 2,
      this.game.height / 2,
      this.game.width,
      this.game.height
    );
    // 利用四叉树做碰撞检测
    let enemysQuadTree = new QuadTree<Spacecraft>(boundary);
    enemysQuadTree.addAll(this.game.others.values());
    this.game.self.texture.bullets.bullets.forEach((bullet) => {
      let bulletArea = bullet.getArea();
      enemysQuadTree.find(bulletArea).forEach((enemy) => {
        // 碰撞检测（只对自己的子弹做检测）
        if (bulletArea.collisionReact(enemy.getArea())) {
          this.collisionCheckResult.push({
            hitted_id: enemy.uid,
            bullet: {
              pos: bullet.pos,
              dir: bullet.dir,
            },
          });
          bullet.hitted = true;
          this.game.network.onShotEmeny(enemy, bullet);
        }
      });
    });
  }
  process() {
    this.collisionCheckResult.forEach((item) => {
      let hitted_id = item.hitted_id;
      let bullet = item.bullet;

      let beHittedPlayer =
        this.game.self.uid == hitted_id
          ? this.game.self
          : this.game.others.get(hitted_id)!;

      if (beHittedPlayer == undefined) return;

      beHittedPlayer.bloods -= 1;
      beHittedPlayer.vel.add(bullet.dir.mulNew(20));

      // 添加粒子效果
      this.game.particle.addParticles(bullet.pos, bullet.dir);

      // 血量为0
      if (beHittedPlayer.bloods <= 0) {
        // 如果是自己就重新开始游戏
        if (beHittedPlayer.uid == this.game.self.uid) {
          this.game.Play();
        } else {
          // 如果是别人就删除该玩家
          this.game.others.delete(beHittedPlayer.uid);
        }
      }
    });
    this.collisionCheckResult = [];
  }
}

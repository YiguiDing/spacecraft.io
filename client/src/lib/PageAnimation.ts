import { Game } from "./Game";

let ignoredTypes = ["HTML", "META", "HEAD", "BODY", "SCRIPT", "DIV", "IMAGE"];
let hiddenTypes = ["BR", "HR"];
function isLeafElement(element: Element) {
  if (hiddenTypes.includes(element.tagName.toUpperCase())) return true;
  if (element.children.length == 0) return true;
  return false;
}
export class PageAnimation {
  constructor(public gm: Game) {}
  update() {
    // 自动滚动屏幕的效果
    this.gm.config.autoScrollPage && this.autoScrollPage();
    // 攻击html元素效果
    !this.gm.config.onlineMode && this.attackHtmlElement();
  }
  attackHtmlElement() {
    if (this.gm.config.gameRootEleRef) {
      // hide
      let backup = this.gm.config.gameRootEleRef.style.display;
      this.gm.config.gameRootEleRef.style.display = "none";
      //
      this.gm.self.weapon.bullets.forEach((bullet) => {
        // 从子弹的绝对坐标转换到屏幕的相对坐标
        let relativeX = bullet.pos.x - this.gm.viewPos.x;
        let relativeY = bullet.pos.y - this.gm.viewPos.y;
        let element = document.elementFromPoint(relativeX, relativeY);
        if (
          // 能获取到
          element &&
          // 不能是body之类的元素
          !ignoredTypes.includes(element.tagName.toUpperCase()) &&
          // 必须是叶节点
          isLeafElement(element)
        ) {
          // 子弹标记为已经击中目标
          bullet.hitted = true;
          // 删除该元素
          element.parentElement?.removeChild(element);
          // 添加撞击效果
          this.gm.particle.addParticles(bullet.pos, bullet.dir, 100);
        }
      });
      // back
      this.gm.config.gameRootEleRef.style.display = backup;
    }
  }
  autoScrollPage() {
    let newX =
      Math.floor(this.gm.self.pos.x / this.gm.viewWidth) * this.gm.viewWidth;
    let newY =
      Math.floor(this.gm.self.pos.y / this.gm.viewHeight) * this.gm.viewHeight;
    if (newX != this.gm.viewPos.x || newY != this.gm.viewPos.y) {
      // 计算相对于网页的位置
      let percentW = newX / this.gm.width;
      let percentH = newY / this.gm.height;
      let totalWidht = document.documentElement.scrollWidth;
      let totalHiehgt = document.documentElement.scrollHeight;
      window.scrollTo(totalWidht * percentW, totalHiehgt * percentH);
    }
    // 限制移动范围
    // this.game.viewPos.x = bound(0, newX, this.game.width - this.game.viewWidth);
    // this.game.viewPos.y = bound(0, newY, this.game.height - this.game.viewHeight);
    // this.gm.viewPos.x = newX;
    // this.gm.viewPos.y = newY;
  }
}

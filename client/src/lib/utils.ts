import { nanoid } from "nanoid";

/**
 * 角度=>弧度
 */
export function radians(deg: number) {
  // 1 * π rad = 180°
  // 1 * π / 180 rad = 1°
  return deg * (Math.PI / 180);
}
/**
 * 弧度=>角度
 */
export function angle(rad: number) {
  // 1 * π rad = 180°
  // 1  rad = 180° / π
  return rad * (180 / Math.PI);
}
/**
 * 从指定的闭区间[from,to]中得到一个随机`整数`
 */
export function random_int(from: number, to: number) {
  return Math.floor(from + Math.random() * (to + 1));
}
/**
 * 从指定的闭区间[from,to]中得到一个随机`小数`
 */
export function random_flo(from: number, to: number) {
  return from + Math.random() * (to + 1);
}

export function random_pick<T>(items: Array<T>) {
  return items[random_int(0, items.length - 1)];
}

export function bound(minVal: number, current: number, maxVal: number) {
  return Math.max(minVal, Math.min(current, maxVal));
}
export function unbound(minVal: number, current: number, maxVal: number) {
  if (current < minVal) return maxVal;
  if (current > maxVal) return minVal;
  return current;
}

/**
 * 绘制贝塞尔曲线
 * @param start 起始点
 * @param end 结束
 * @param ctrl 控制点
 */
export function drawBezierLine(
  ctx: CanvasRenderingContext2D,
  start: [number, number],
  end: [number, number],
  ctrl: [number, number]
) {
  //绘制2次贝塞尔曲线
  ctx.beginPath();
  ctx.moveTo(start[0], start[1]);
  ctx.quadraticCurveTo(ctrl[0], ctrl[1], end[0], end[1]);
  ctx.closePath();
}
/**
 * 绘制多边形
 * @param ctx
 * @param points 多边形顶点，顺时针或逆时针
 * @param fillStyle 填充色
 * @param strokeStyle 外边框
 */
export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  fillStyle?: string,
  strokeStyle?: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let idx = 1; idx < points.length; idx++) {
    ctx.lineTo(points[idx][0], points[idx][1]);
  }
  ctx.closePath();
  strokeStyle && (ctx.strokeStyle = strokeStyle) && ctx.stroke();
  fillStyle && (ctx.fillStyle = fillStyle) && ctx.fill();
  ctx.restore();
}

export function getUid() {
  return nanoid(8);
  let uid;
  if ((uid = localStorage.getItem("spacecraft:uid"))) {
  } else {
    localStorage.setItem("spacecraft:uid", (uid = nanoid(8)));
  }
  return uid;
}

// ------------------------------------PlayerShortInfoFrame---------------------------------------
export interface PlayerInfoFrame {
  uname: string;
  uid: string;
  fillStyle: string;
  strokeStyle: string;
}
// ------------------------------------PlayerDataFrame---------------------------------------
export interface PlayerDataFrame {
  uid: string;
  pos: Float32Array; // 位置
  dir: Float32Array; // 方向
  vel: Float32Array; // 加速度
}
// ------------------------------------PlayerShotEnemyFrame---------------------------------------
export interface PlayerShotEnemyFrame {
  uid: string;
  shotted_uid: string;
  bullet_info: {
    pos: Float32Array; // 位置
    dir: Float32Array; // 方向
  };
}
// ------------------------------------PlayerInputsFrame---------------------------------------
export interface PlayerInputsFrame {
  uid: string;
  inputs: Int8Array;
}

import { Game } from "./Game";
import { io, Socket } from "socket.io-client";
import { Observer } from "./interface/Observer";
import { Bullet, Spacecraft } from "./Spacecraft";
import { InputListener, Actions } from "./InputListener";
import {
  PlayerDataFrame,
  PlayerInfoFrame,
  PlayerInputsFrame,
  PlayerShotEnemyFrame,
} from "@common/src/index";
import { Vector } from "./Vender";

export class Net implements Observer {
  inputs = new Map<string, Actions>();
  lastSyncTime = Date.now();
  syncInterval = 2000;
  lastBeartbeatTime = Date.now();
  heartbeatInterval = 5000;
  isConnect = false;
  netHelper = new NetHelper();
  client!: Socket;
  constructor(private game: Game, private inputListener: InputListener) {
    this.inputListener.attach(this);
  }
  init() {
    this.client = io(this.game.config.serverAddr || window.location.host, {
      withCredentials: false, // for Access-Control-Allow-Origin: "*"
      autoConnect: false,
    });
    this.client.connect();
    // 连接
    this.client.on("connect", () => {
      console.log("connect");
      this.isConnect = true;
      this.enter();
    });
    this.client.on("reconnect", () => {
      console.log("reconnect");
      this.isConnect = true;
      this.enter();
    });
    this.client.on("disconnect", () => {
      console.log("disconnect");
      this.isConnect = false;
    });
  }
  enter() {
    if (this.isConnect) {
      this.listen();
      // 连接成功后进入游戏
      this.client.emit(
        "enter",
        this.netHelper.getPlayerInfoFrame(this.game),
        (syncData: PlayerDataFrame) => {
          console.log("syncData");
          console.log(syncData);
          this.netHelper.applySelfDataFrame(this.game, syncData);
        }
      );
      // 请求获取其他玩家的信息
      this.client.emit(
        "users",
        this.netHelper.getPlayerInfoFrame(this.game),
        (frames: PlayerInfoFrame[]) => {
          this.netHelper.applyPlayerInfoFrame(this.game, frames);
        }
      );
      // 帧同步
      this.client.emit("sync", this.netHelper.getPlayerDataFrame(this.game));
    }
  }
  listen() {
    if (this.isConnect) {
      // 监听其他用户进入游戏
      this.client.on("enter", (frames: PlayerInfoFrame[]) => {
        this.netHelper.applyPlayerInfoFrame(this.game, frames);
      });
      // 监听其他用户的同步数据
      this.client.on("sync", (frame: PlayerDataFrame[]) => {
        this.netHelper.applyPlayerDataFrame(this.game, frame);
      });
      // 监听其他用户的按键事件
      this.client.on("input", (frame: PlayerInputsFrame) => {
        this.netHelper.applyPlayerInputsFrame(this.game, frame);
      });
      // 监听其他用户的按键事件
      this.client.on("shot", (frame: PlayerShotEnemyFrame) => {
        this.netHelper.applyPlayerShotEnemyFrame(this.game, frame);
      });
      // 监听其他用户的离开事件
      this.client.on("leave", (frame: PlayerInfoFrame) => {
        this.netHelper.applyPlayerLeaveFrame(this.game, frame);
      });
    }
  }
  onPlay() {
    if (this.isConnect) {
      // 连接成功后进入游戏
      this.client.emit("enter", this.netHelper.getPlayerInfoFrame(this.game));
    }
  }
  onShotEmeny(shotted_enemy: Spacecraft, bullet: Bullet) {
    if (this.isConnect) {
      this.client.emit(
        "shot",
        this.netHelper.getPlayerShotEnemyFrame(this.game, shotted_enemy, bullet)
      );
    }
  }
  onGameUpdate() {
    if (this.isConnect) {
      const now = Date.now();
      if (this.lastSyncTime + this.syncInterval < now) {
        this.lastSyncTime = now;
        // 帧同步
        this.client.emit("sync", this.netHelper.getPlayerDataFrame(this.game));
      }
      if (this.lastBeartbeatTime + this.heartbeatInterval < now) {
        this.lastBeartbeatTime = now;
        // 上报心跳
        this.client.emit("heartbeat");
      }
    }
  }
  onInputChange() {
    if (this.isConnect) {
      // 本地输入有更新则发送同步数据
      this.client.emit("input", this.netHelper.getPlayerInputsFrame(this.game));
    }
  }
  destory() {
    this.client?.disconnect();
  }
}

class NetHelper {
  getPlayerInfoFrame(game: Game): PlayerInfoFrame {
    return {
      uid: game.self.uid,
      uname: game.self.uname,
      fillStyle: game.self.fillStyle,
      strokeStyle: game.self.strokeStyle,
    };
  }
  applyPlayerInfoFrame(game: Game, frames: PlayerInfoFrame[]) {
    frames.forEach((frame) => {
      if (frame.uid == game.self.uid) return;
      let other =
        game.others.get(frame.uid) ||
        new Spacecraft(game, frame.uid, frame.uname);
      other.uname = frame.uname;
      other.fillStyle = frame.fillStyle;
      other.strokeStyle = frame.strokeStyle;
      game.others.set(frame.uid, other);
    });
  }
  applyPlayerLeaveFrame(game: Game, frame: PlayerInfoFrame) {
    game.others.delete(frame.uid);
    game.network.inputs.delete(frame.uid);
  }
  getPlayerDataFrame(game: Game): PlayerDataFrame {
    return {
      uid: game.self.uid,
      pos: new Float32Array([game.self.pos.x, game.self.pos.y]),
      dir: new Float32Array([game.self.dir.x, game.self.dir.y]),
      vel: new Float32Array([game.self.vel.x, game.self.vel.y]),
    };
  }
  applySelfDataFrame(game: Game, frame: PlayerDataFrame) {
    if (game.self.uid == frame.uid) {
      let self = game.self;
      let pos = Array.from(new Float32Array(frame.pos));
      let dir = Array.from(new Float32Array(frame.dir));
      let vel = Array.from(new Float32Array(frame.vel));
      self.pos.x = pos[0];
      self.pos.y = pos[1];
      self.dir.x = dir[0];
      self.dir.y = dir[1];
      self.vel.x = vel[0];
      self.vel.y = vel[1];
    }
  }
  applyPlayerDataFrame(game: Game, frames: PlayerDataFrame[]) {
    frames.forEach((frame) => {
      if (game.others.has(frame.uid)) {
        let other = game.others.get(frame.uid)!;
        let pos = Array.from(new Float32Array(frame.pos));
        let dir = Array.from(new Float32Array(frame.dir));
        let vel = Array.from(new Float32Array(frame.vel));
        other.pos.x = pos[0];
        other.pos.y = pos[1];
        other.dir.x = dir[0];
        other.dir.y = dir[1];
        other.vel.x = vel[0];
        other.vel.y = vel[1];
      }
    });
  }
  getPlayerShotEnemyFrame(
    game: Game,
    shottedEnemy: Spacecraft,
    bullet: Bullet
  ): PlayerShotEnemyFrame {
    return {
      uid: game.self.uid,
      shotted_uid: shottedEnemy.uid,
      bullet_info: {
        pos: new Float32Array([bullet.pos.x, bullet.pos.y]),
        dir: new Float32Array([bullet.dir.x, bullet.dir.y]),
      },
    };
  }
  applyPlayerShotEnemyFrame(game: Game, frame: PlayerShotEnemyFrame) {
    let dir = Array.from(new Float32Array(frame.bullet_info.dir));
    let pos = Array.from(new Float32Array(frame.bullet_info.pos));
    game.collision.collisionCheckResult.push({
      hitted_id: frame.shotted_uid,
      bullet: {
        dir: new Vector(dir[0], dir[1]),
        pos: new Vector(pos[0], pos[1]),
      },
    });
  }
  getPlayerInputsFrame(game: Game): PlayerInputsFrame {
    return {
      uid: game.self.uid,
      inputs: new Int8Array(game.input.inputs),
    };
  }
  applyPlayerInputsFrame(game: Game, frame: PlayerInputsFrame) {
    game.network.inputs.set(frame.uid, Array.from(new Int8Array(frame.inputs)));
  }
}

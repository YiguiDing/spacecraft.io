import { Server } from "socket.io";
import type {
  PlayerInfoFrame,
  PlayerDataFrame,
  PlayerInputsFrame,
} from "@common/src/Frames";
import { DL_Element, DolbueLinkedList } from "./DLInkedList";
let dev = false;
export class Game {
  players_info = new Map<string, PlayerInfoFrame>();
  players_sync = new Map<string, PlayerDataFrame>();
  sid2uid = new Map<string, string>(); // socketId => userId
  uid2sid = new Map<string, string>(); // userId => socketId
  heartbeatService = new heartbeatService<PlayerInfoFrame>();
  constructor(private io: Server) {}
  run() {
    this.heartbeatService.run();
    this.io.on("connection", (socket) => {
      dev && console.log("connection");
      let playerInfo = null;
      socket.on("enter", (data: PlayerInfoFrame) => {
        dev && console.log("enter");
        playerInfo = data;
        socket.broadcast.emit("enter", [data]);
        this.uid2sid.set(data.uid, socket.id);
        this.sid2uid.set(socket.id, data.uid);
        this.players_info.set(socket.id, data);
      });
      socket.on("heartbeat", () => {
        dev && console.log("heartbeat");
        if (playerInfo) {
          this.heartbeatService.heartbeatHandler(socket.id, playerInfo);
        }
      });
      socket.on("users", (data: PlayerDataFrame, callback) => {
        dev && console.log("users");
        dev && console.log(data);
        callback([...this.players_info.values()]);
      });
      socket.on("sync", (data: PlayerDataFrame) => {
        dev && console.log("sync");
        dev && console.log(data);
        this.io.emit("sync", [data]);
        // this.players_sync.set(socket.id, data); // save
      });
      socket.on("input", (data: PlayerInputsFrame) => {
        dev && console.log("input");
        dev && console.log(data);
        socket.broadcast.emit("input", data);
      });
      socket.on("shot", (data) => {
        dev && console.log("shot");
        dev && console.log(data);
        socket.broadcast.emit("shot", data);
      });
      socket.on("disconnect", (reason) => {
        dev && console.log("disconnect");
        dev && console.log(reason);
        if (this.players_info.has(socket.id)) {
          const playInfo = this.players_info.get(socket.id);
          const playerId = playInfo.uid;

          // leave
          socket.broadcast.emit("leave", playInfo);
          this.players_info.delete(socket.id);
          this.players_sync.delete(socket.id);
          this.sid2uid.delete(socket.id);
          this.uid2sid.delete(playerId);
        }
      });
    });
    this.heartbeatService.onHeartStopBeat((stopedHeartbeat) => {
      const playInfo = stopedHeartbeat.data;
      const socketId = stopedHeartbeat.key;
      const playerId = playInfo.uid;

      // leave
      this.io.emit("leave", playInfo);
      this.players_info.delete(socketId);
      this.players_sync.delete(socketId);
      this.sid2uid.delete(socketId);
      this.uid2sid.delete(playerId);
    });
  }
  destory() {
    this.heartbeatService.destory();
  }
}

interface Heartbeat<T> {
  data: T;
  key: string;
  timestamp: number;
}
type StopedHeartbeatHandler<T> = (stopedHeartbeat: Heartbeat<T>) => void;
class heartbeatService<T> {
  heartbeatMap = new Map<string, DL_Element<Heartbeat<T>>>();
  heartbeatList = new DolbueLinkedList<Heartbeat<T>>();
  handlers: StopedHeartbeatHandler<T>[] = [];
  heartbeatTimer = null;
  keepAlive = 10000;
  constructor() {}
  heartbeatHandler(key: string, data: T) {
    // 删除旧的
    if (this.heartbeatMap.has(key)) {
      // 通过id找到节点
      let node = this.heartbeatMap.get(key);
      // 在双链表中删除节点
      this.heartbeatList.delete(node);
      // 在Map中删除节点
      this.heartbeatMap.delete(key);
    }
    // 创建新的
    // 插入数据获取到`ListElement`
    let element = this.heartbeatList.tailPush({
      key: key,
      data: data,
      timestamp: Date.now(),
    });
    // 存入map,方便再次找到
    this.heartbeatMap.set(key, element);
  }
  onHeartStopBeat(handler: StopedHeartbeatHandler<T>) {
    this.handlers.push(handler);
  }
  run() {
    this.heartbeatTimer = setInterval(() => {
      let now = Date.now();
      do {
        let stopedHeartbeat = this.heartbeatList.getHead();
        if (
          stopedHeartbeat &&
          stopedHeartbeat.timestamp + this.keepAlive < now
        ) {
          // 删除
          this.heartbeatList.headPop();
          this.heartbeatMap.delete(stopedHeartbeat.key);
          // 执行回调
          this.handlers.forEach((handler) => {
            handler(stopedHeartbeat);
          });
        } else {
          break;
        }
      } while (true);
    }, 2000);
  }
  destory() {
    clearInterval(this.heartbeatTimer);
  }
}

enum MsgType {
  PlayerIn,
  PlayLeave,
}
interface NewPlayerInMsg {
  type: MsgType.PlayerIn;
  data: {
    uname: string;
    uinfo: string;
  };
}
interface NewPlayerPlayLeaveMsg {
  type: MsgType.PlayLeave;
  data: {
    uname: string;
    uinfo: string;
  };
}
type MsgData = NewPlayerInMsg | NewPlayerPlayLeaveMsg;
type MsgHandler = (msg: MsgData) => void;

export class MessageManager {
  callbacks: MsgHandler[] = [];
  constructor() {}
  onNewPlayerEnter(msg: MsgData) {
    this.callbacks.forEach((callback) => callback(msg));
  }
}

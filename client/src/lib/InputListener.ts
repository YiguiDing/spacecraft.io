import { Observer, Subject } from "./interface/Observer";
import _ from "lodash";

export enum Action {
  MoveOn,
  TurnLeft,
  TurnRight,
  Fire,
  Exit,
  BreakUp,
  SpeedUp,
}
export type InputKeys =
  | "ArrowUp"
  | "KeyW"
  | "Keyw"
  | "ArrowLeft"
  | "KeyA"
  | "Keya"
  | "ArrowRight"
  | "KeyD"
  | "Keyd"
  | "Space"
  | "Escape"
  | "ShiftLeft"
  | "ControlLeft";

export const InputCodeMap: {
  [key in InputKeys]: Action;
} = {
  // MoveOn
  ArrowUp: Action.MoveOn,
  KeyW: Action.MoveOn,
  Keyw: Action.MoveOn,
  //  TurnLeft
  ArrowLeft: Action.TurnLeft,
  KeyA: Action.TurnLeft,
  Keya: Action.TurnLeft,
  //  TurnRight
  ArrowRight: Action.TurnRight,
  KeyD: Action.TurnRight,
  Keyd: Action.TurnRight,
  // Fire
  Space: Action.Fire,
  // MoveOn
  Escape: Action.MoveOn,
  // SpeedUp
  ControlLeft: Action.SpeedUp,
  // BreakUp
  ShiftLeft: Action.BreakUp,
};
export type Actions = Array<Action>;

const validActionCodes = Object.values(Action);

export class InputListener implements Subject {
  observers: Array<Observer> = [];
  inputs: Actions = new Array<number>();
  listenMouseDoHandler = (event: MouseEvent) => {
    // event.preventDefault();
  };
  listenMouseUpHandler = (event: MouseEvent) => {
    // event.preventDefault();
  };
  listenKeyDoHandler = (event: KeyboardEvent) => {
    if (event.repeat) return;
    let code = InputCodeMap[event.code as InputKeys];
    if (validActionCodes.includes(code)) {
      event.preventDefault();
      this.inputs.push(code);
      this.inputs = _.uniq(this.inputs);
      this.notify();
    }
  };
  listenKeyUpHandler = (event: KeyboardEvent) => {
    if (event.repeat) return;
    let code = InputCodeMap[event.code as InputKeys];
    if (this.inputs.includes(code)) {
      event.preventDefault();
      _.pull(this.inputs, code);
      this.notify();
    }
  };
  listen() {
    window.addEventListener("keydown", this.listenKeyDoHandler);
    window.addEventListener("keyup", this.listenKeyUpHandler);
    window.addEventListener("mousedown", this.listenMouseDoHandler);
    window.addEventListener("mouseup", this.listenMouseUpHandler);
  }
  destory() {
    window.removeEventListener("keydown", this.listenKeyDoHandler);
    window.removeEventListener("keyup", this.listenKeyUpHandler);
    window.removeEventListener("mousedown", this.listenMouseDoHandler);
    window.removeEventListener("mouseup", this.listenMouseUpHandler);
  }
  attach(observer: Observer): void {
    this.observers.push(observer);
  }
  detach(observer: Observer): void {
    _.pull(this.observers, observer);
  }
  notify(): void {
    this.observers.forEach((item) => item.onInputChange());
  }
}

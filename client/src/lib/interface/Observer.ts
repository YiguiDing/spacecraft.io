export interface Subject {
  observers: Array<Observer>;
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

export interface Observer {
  onInputChange(): void;
}

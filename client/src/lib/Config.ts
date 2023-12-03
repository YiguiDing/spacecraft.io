export class Config {
  userName = "Player";
  onlineMode = true;
  autoScrollPage = true;
  serverAddr = window.location.host;
  gameRootEleRef?: HTMLElement;
  constructor(config?: Partial<Config>) {
    config && Object.assign(this, config);
  }
}

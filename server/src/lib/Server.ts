import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Game } from "./Game";
import cors from "cors";
import { Config } from "./Config";

export class WebApp {
  expressApp = express();
  httpServer: http.Server;
  ioServer: Server;
  gameServer: Game;
  config = new Config();
  constructor(config?: Config) {
    config && (this.config = config);
    console.dir(this.config);
    this.init();
  }
  init() {
    let corsOptions = {
      cors: {
        origin: this.config.cors_origin,
      },
      credentials: true,
    };
    this.expressApp.use(cors(corsOptions));
    this.httpServer = http.createServer(this.expressApp);
    this.ioServer = new Server(this.httpServer, { cors: corsOptions });
    this.gameServer = new Game(this.ioServer);
  }
  run() {
    this.gameServer.run();
    let port = this.config.port;
    let host = this.config.host;
    this.httpServer.listen(port, host, () => {
      console.log(`game server is running at http://${host}:${port}/`);
    });
  }
  stop() {
    this.httpServer.close(() => {
      console.log(`game server is closed`);
    });
  }
  check_memory() {
    setInterval(() => {
      console.log("-------------------check-------------------");
      console.dir(this.gameServer.players_info, { depth: null });
      console.dir(this.gameServer.players_sync, { depth: null });
      console.dir(this.gameServer.uid2sid, { depth: null });
      console.dir(this.gameServer.sid2uid, { depth: null });
      console.dir(this.gameServer.heartbeatService.heartbeatList, {
        depth: null,
      });
      console.dir(this.gameServer.heartbeatService.heartbeatMap, {
        depth: null,
      });
    }, 5000);
  }
}

import { WebApp, Config } from "./index";

const config = new Config({
  host: "0.0.0.0",
  port: 3333,
  cors_origin: ["*"],
});

const app = new WebApp(config);

app.run();

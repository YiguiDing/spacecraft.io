import { CorsOptions } from "cors";
export class Config {
  host = "0.0.0.0";
  port = 8088;
  cors_origin: CorsOptions["origin"] = ["*"];
  constructor(config?: Partial<Config>) {
    config && Object.assign(this, config);
  }
}

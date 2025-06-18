import { Adapter } from "./adapter";
import { AdapterOptions, App } from "./types";

export function createSource({
  app,
  options,
}: {
  app?: App;
  options?: AdapterOptions;
} = {}) {
  return new Adapter(app, options);
}

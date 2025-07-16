import { URPC } from "@unilab/urpc";

let initialized = false;
export function initUrpcClient() {
  if (!initialized) {
    initialized = true;
    URPC.init({
      baseUrl: "http://localhost:3000/api",
    });
  }
  return initialized;
}

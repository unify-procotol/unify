import { URPC } from "@unilab/urpc";

let initialized = false;
export function initUrpcClient() {
  if (!initialized) {
    initialized = true;
    URPC.init({
      baseUrl: "http://localhost:3000/api",
      timeout: 10000,
      headers: {
        Authorization: "Bearer your-token-here",
      },
    });
  }
  return initialized;
}

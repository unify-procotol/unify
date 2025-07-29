import { URPC } from "@unilab/urpc";
import { logging } from "@unilab/urpc-core/middleware";
import { MastraClientPlugin } from "@unilab/mastra-client-plugin";

export function initUrpcClient() {
  if (typeof window === "undefined") {
    return;
  }

  const baseUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api` : `/api`;

  URPC.init({
    // local urpc server
    plugins: [MastraClientPlugin()],
    middlewares: [logging()],

    // remote urpc server
    baseUrl,
    timeout: 20000,
  });
}

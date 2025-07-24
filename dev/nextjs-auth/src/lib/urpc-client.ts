import { URPC } from "@unilab/urpc";

export function initUrpcClient() {
  URPC.init({
    baseUrl: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api`,
    timeout: 20000,
  });
}

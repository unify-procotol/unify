import { URPC } from "@unilab/urpc-hono";
import { FinancePlugin } from "@unilab/finance";

const app = URPC.init({
  plugins: [FinancePlugin()],
  entityConfigs: {
    stock: {
      defaultSource: "yahoo", // yahoo or seeking-alpha
    },
  },
});

export default {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};

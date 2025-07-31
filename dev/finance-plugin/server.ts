import { URPC } from "@unilab/urpc-hono";
import { FinancePlugin } from "@unilab/finance";

const app = URPC.init({
  plugins: [FinancePlugin({
    alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY!,
  })],
  entityConfigs: {
    currency: {
      defaultSource: "alpha-vantage",
    },
  },
});

export default {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};

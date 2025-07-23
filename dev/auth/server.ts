import { URPC } from "@unilab/urpc-hono";
import { auth } from "@unilab/urpc-core/middleware";
import { Context } from "hono";

// Simple mock user decoder
const decodeToken = (token: string) => {
  // Mock JWT decode - in real implementation, use proper JWT library
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      roles: payload.roles || [],
    };
  } catch {
    return null;
  }
};

const app = URPC.init({
  plugins: [],
  middlewares: [
    auth({
      required: {
        entities: ["user"],
      },
      getUser: async (c: Context) => {
        try {
          const token = c.req.header('Authorization')?.split(' ')[1]
          if (!token) {
            return null
          }
          // jwt decode
          const user = decodeToken(token)
          console.log('user=>', user)
          return user;
        } catch (error: any) {
          return null;
        }
      },
    }),
  ],
  entityConfigs: {},
});

export default {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
}; 
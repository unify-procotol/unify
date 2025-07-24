import Redis from "ioredis";
import { BentoCache, bentostore } from "bentocache";
import { memoryDriver } from "bentocache/drivers/memory";
import { redisDriver } from "bentocache/drivers/redis";

const bentoGlobal = global as typeof global & {
  bentocache?: BentoCache<any>;
};

const stores = bentostore().useL1Layer(
  memoryDriver({ maxItems: 300, maxSize: 10_000_000 })
);

if (process.env.REDIS_HOST) {
  stores.useL2Layer(
    redisDriver({
      connection: new Redis({
        host: process.env.REDIS_HOST!,
        port: parseInt(process.env.REDIS_PORT!),
        password: process.env.REDIS_PASSWORD!,
        connectionName: "urpc-demo",
        tls: {
          servername: process.env.REDIS_HOST!,
        },
        maxRetriesPerRequest: 5,
        db: 0,
      }),
    })
  );
}
export const bentocache =
  bentoGlobal.bentocache ||
  new BentoCache({
    prefix: "urpc-demo",
    default: "multitier",
    stores: {
      multitier: stores,
    },
    timeout: "1s",
    hardTimeout: "5s",
    ttl: "1m",
    grace: "24h",
    graceBackoff: "1m",
  });

if (!bentoGlobal.bentocache) {
  bentoGlobal.bentocache = bentocache;
}

import { BlankEnv, BlankSchema } from "hono/types";
import type { Hono } from "hono";
import { EntityConfig, Storage } from "@unify/core";

export interface SourceConfig {
  id: string;
  entities: {
    [entityName: string]: EntityConfig;
  };
  middleware?: Array<(c: any, next: () => Promise<void>) => Promise<void>>;
}

export interface AdapterOptions {
  storage?: Storage;
}

export interface App extends Hono<BlankEnv, BlankSchema, "/"> {}

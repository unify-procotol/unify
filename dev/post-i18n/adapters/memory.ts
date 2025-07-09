import {
  BaseAdapter,
  CreationArgs,
  ErrorCodes,
  FindOneArgs,
  URPCError,
} from "@unilab/urpc-core";
import { CacheEntity } from "../entities/cache";
import { LRUCache } from "lru-cache";

export class MemoryAdapter extends BaseAdapter<CacheEntity> {
  private cache: LRUCache<string, any> | null = null;

  constructor({
    ttl = 1000 * 60 * 5,
    max = 500,
    maxSize = 5000,
    sizeCalculation = (value, key) => {
      // Calculate size based on JSON string length (rough approximation)
      const keySize = key ? new Blob([key]).size : 0;
      const valueSize = value ? new Blob([JSON.stringify(value)]).size : 0;
      return keySize + valueSize;
    },
    allowStale = false,
  }: {
    // how long to live in ms
    ttl?: number;
    max?: number;
    // for use with tracking overall storage size
    maxSize?: number;
    // Add sizeCalculation function to calculate the size of each cache entry
    sizeCalculation?: (value: any, key: string) => number;
    // return stale items before removing from cache?
    allowStale?: boolean;
  } = {}) {
    super();
    this.cache = new LRUCache({
      ttl,
      max,
      maxSize,
      sizeCalculation,
      allowStale,
    });
  }

  async findOne(args: FindOneArgs<CacheEntity>): Promise<CacheEntity | null> {
    const key = args.where?.key;
    if (key) {
      const value = this.cache?.get(key) || null;
      return {
        key,
        value,
      };
    }
    return null;
  }

  async create(args: CreationArgs<CacheEntity>): Promise<CacheEntity> {
    const { key, value } = args.data;
    if (!key || !value) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "Key and value are required");
    }
    this.cache?.set(key, value);
    return {
      key,
      value,
    };
  }
}

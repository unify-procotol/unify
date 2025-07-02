import type {
  DataSourceAdapter,
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  WhereCondition,
  UpsertArgs,
} from "@unilab/core";
import {
  LRUCache,
  EntityConstructor,
  matchesWhere,
  processFindManyArgs,
  performUpsert,
} from "../utils";

export class MemoryAdapter<T extends Record<string, any>>
  implements DataSourceAdapter<T>
{
  private cache: LRUCache<string, T>;
  private EntityClass: EntityConstructor<T>;

  constructor(EntityClass: EntityConstructor<T>, maxSize: number = 5) {
    this.EntityClass = EntityClass;
    this.cache = new LRUCache<string, T>(maxSize);
  }

  private generateKey(data: Partial<T>): string {
    return JSON.stringify(data);
  }

  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    const entities = Array.from(this.cache.values());
    return processFindManyArgs(entities, args);
  }

  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    const entities = Array.from(this.cache.values());

    for (const entity of entities) {
      if (matchesWhere(entity, args.where)) {
        return entity;
      }
    }

    return null;
  }

  async create(args: CreationArgs<T>): Promise<T> {
    // Create new entity instance
    const entity = new this.EntityClass(args.data);

    // Generate cache key
    const key = this.generateKey(args.data);

    // Store in LRU cache
    this.cache.set(key, entity);

    return entity;
  }

  async update(args: UpdateArgs<T>): Promise<T> {
    const entity = await this.findOne({ where: args.where });

    if (!entity) {
      throw new Error("Entity not found for update");
    }

    // Update entity properties
    Object.assign(entity, args.data);

    // Re-cache the updated entity
    const key = this.generateKey(entity);
    this.cache.set(key, entity);

    return entity;
  }

  async delete(args: DeletionArgs<T>): Promise<boolean> {
    const entities = Array.from(this.cache.keys());
    let deleted = false;

    for (const key of entities) {
      const entity = this.cache.get(key);
      if (entity && matchesWhere(entity, args.where)) {
        this.cache.delete(key);
        deleted = true;
        // Don't break here to allow deleting multiple matching entities
      }
    }

    return deleted;
  }

  async count(args?: { where?: WhereCondition<T> }): Promise<number> {
    if (!args?.where) {
      return this.cache.size();
    }

    const entities = Array.from(this.cache.values());
    return entities.filter((entity) => matchesWhere(entity, args.where!))
      .length;
  }

  async upsert(args: UpsertArgs<T>): Promise<T> {
    return performUpsert(
      args,
      this.findOne.bind(this),
      this.update.bind(this),
      this.create.bind(this)
    );
  }

  getCacheSize(): number {
    return this.cache.size();
  }

  clearCache(): void {
    this.cache.clear();
  }
}

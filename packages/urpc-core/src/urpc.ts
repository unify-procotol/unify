import { BuiltinPlugin } from "./builtin-plugin";
import {
  extractAdapterName,
  extractEntityClassName,
  generateSchemas,
  SchemaObject,
} from "./decorators";
import { getMiddlewareManager } from "./middleware-manager";
import { registerAdapter, simplifyEntityName } from "./repo-register";
import {
  BaseURPCConfig,
  DataSourceAdapter,
  EntityConfigs,
  Middleware,
  Plugin,
} from "./types";

export class BaseURPC {
  static entitySchemas: Record<string, SchemaObject> = {};
  static entitySources: Record<string, string[]> = {};
  static entityConfigs: EntityConfigs = {};

  static init(config: BaseURPCConfig) {
    const plugins = [...(config.plugins || []), BuiltinPlugin(this)];
    this.registerPluginAdapters(plugins);
    this.registerGlobalAdapters({
      plugins: plugins,
      globalAdapters: config.globalAdapters,
    });

    if (config.entityConfigs) {
      this.entityConfigs = config.entityConfigs;
      getMiddlewareManager().setEntityConfigs(this.entityConfigs);
    }

    if (config.middlewares) {
      this.applyMiddlewareToRepos({
        plugins: plugins,
        middlewares: config.middlewares,
      });
    }

    this.analyzeEntities({
      plugins: plugins,
      globalAdapters: config.globalAdapters,
    });
  }

  private static registerPluginAdapters(plugins: Plugin[]) {
    const adapters = plugins.flatMap((p) => p.adapters || []);
    if (adapters.length) {
      adapters.forEach(({ entity, source, adapter }) =>
        registerAdapter(entity, source, adapter)
      );
    }
  }

  private static registerGlobalAdapters({
    plugins,
    globalAdapters = [],
  }: {
    plugins: Plugin[];
    globalAdapters?: (new () => DataSourceAdapter<any>)[];
  }): void {
    if (globalAdapters.length > 0) {
      const entities = plugins.flatMap((p) => p.entities || []);
      globalAdapters.forEach((Adapter) => {
        const source = extractAdapterName(Adapter)
          .toLowerCase()
          .replace("adapter", "");
        entities.forEach((entity) => {
          const entityName = extractEntityClassName(entity);
          registerAdapter(entityName, source, new Adapter());
        });
      });
    }
  }

  private static applyMiddlewareToRepos({
    plugins,
    middlewares,
  }: {
    plugins: Plugin[];
    middlewares: Middleware[];
  }) {
    const entities = plugins.flatMap((p) => p.entities || []);
    middlewares.forEach((m) => {
      const requiredEntities = m.required?.entities;
      if (requiredEntities) {
        const entityNames = entities.map((e) => simplifyEntityName(e.name));
        const missingEntities = requiredEntities.filter(
          (entity) => !entityNames.includes(simplifyEntityName(entity))
        );
        if (missingEntities.length > 0) {
          throw new Error(
            `Middleware ${m.name} requires entities: ${missingEntities.join(
              ", "
            )}`
          );
        }
      }
      getMiddlewareManager().use(m);
    });
    console.log(
      `✅ Registered middlewares: ${middlewares.map((m) => m.name).join(", ")}`
    );
  }

  private static analyzeEntities({
    plugins,
    globalAdapters,
  }: {
    plugins: Plugin[];
    globalAdapters?: (new () => DataSourceAdapter<any>)[];
  }) {
    const entities = plugins.flatMap((p) => p.entities || []);
    const adapters = plugins.flatMap((p) => p.adapters || []);

    if (entities.length > 0) {
      this.entitySchemas = generateSchemas(entities);
    }

    const entitySources: Record<string, string[]> = {};

    adapters.forEach(({ source, entity }) => {
      if (!entitySources[entity]) {
        entitySources[entity] = [];
      }
      entitySources[entity].push(source);
    });

    if (globalAdapters && entities) {
      globalAdapters.forEach((adapter) => {
        entities.forEach((entity) => {
          const entityName = extractEntityClassName(entity);
          const source = extractAdapterName(adapter)
            .toLowerCase()
            .replace("adapter", "");
          if (!entitySources[entityName]) {
            entitySources[entityName] = [];
          }
          entitySources[entityName].push(source);
        });
      });
    }

    this.entitySources = entitySources;
  }

  static getEntitySchemas(): Record<string, SchemaObject> {
    return this.entitySchemas;
  }

  static getEntitySources(): Record<string, string[]> {
    return this.entitySources;
  }

  static getEntityConfigs(): EntityConfigs {
    return this.entityConfigs;
  }
}

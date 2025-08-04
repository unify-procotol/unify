import { BuiltinPlugin } from "./builtin-plugin";
import {
  extractEntityClassName,
  generateSchemas,
  SchemaObject,
} from "./decorators";
import { getMiddlewareManager } from "./middleware-manager";
import { getRepo, registerAdapter, simplifyEntityName } from "./repo-register";
import {
  BaseURPCConfig,
  EntityConfigs,
  GlobalAdapterConfig,
  Middleware,
  Plugin,
} from "./types";

export class BaseURPC {
  private static _initialized = false;
  static entitySchemas: Record<string, SchemaObject> = {};
  static entitySources: Record<string, string[]> = {};
  static entityConfigs: EntityConfigs = {};

  static init(config: BaseURPCConfig) {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    const plugins = [
      ...(config.plugins || []),
      BuiltinPlugin({
        URPC: this,
      }),
    ];
    this.registerPluginAdapters(plugins);
    this.registerGlobalAdapters({
      plugins: plugins,
      globalAdapters: config.globalAdapters,
    });

    if (config.entityConfigs) {
      this.entityConfigs = {
        ...config.entityConfigs,
        _schema: {
          ...config.entityConfigs._schema,
          defaultSource: "_global",
        },
        _data: {
          ...config.entityConfigs._data,
          defaultSource: "_global",
        },
      };
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

    this.ininData();
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
    globalAdapters?: GlobalAdapterConfig[];
  }): void {
    if (globalAdapters.length > 0) {
      const entities = plugins.flatMap((p) => p.entities || []);
      globalAdapters.forEach((config) => {
        entities.forEach((entity) => {
          const entityClassName = extractEntityClassName(entity);
          const adapter = config.factory(entityClassName);
          registerAdapter(entityClassName, config.source, adapter);
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
    globalAdapters?: GlobalAdapterConfig[];
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
      globalAdapters.forEach((config) => {
        entities.forEach((entity) => {
          const entityName = extractEntityClassName(entity);
          if (!entitySources[entityName]) {
            entitySources[entityName] = [];
          }
          entitySources[entityName].push(config.source);
        });
      });
    }

    this.entitySources = entitySources;
  }

  private static async ininData() {
    Object.keys(this.entityConfigs).forEach(async (entity) => {
      const config = this.entityConfigs[entity];
      const initData = config.initData;
      const source = config.defaultSource;
      if (initData && initData.length > 0) {
        if (source) {
          const _repo = getRepo(entity, source);
          if (_repo) {
            try {
              if (initData.length > 1) {
                await _repo.createMany({
                  data: initData,
                });
              } else {
                await _repo.create({
                  data: initData[0],
                });
              }
            } catch (error: any) {
              console.error(
                `Failed to initialize data for ${entity}: ${error.message}`
              );
            }
          } else {
            console.error(
              `Failed to initialize data for ${entity}: No repo found for ${entity} in ${source}`
            );
          }
        } else {
          console.error(
            `Failed to initialize data for ${entity}: No defaultSource found for ${entity}`
          );
        }
      }
    });
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

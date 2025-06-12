export { Adapter } from "./adapter";
export {
  SourceConfig,
  EntityConfig,
  EntityFunction,
  EntityProcedure,
  ORPCProcedure,
  QueryArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  CreateArgs,
  DeleteArgs,
  RestMethodMapping,
  AdapterOptions,
  App,
  DatabaseDefaultValue,
  DEFAULT_METHOD_MAPPING,
} from "./types";
export {
  parseRequestArgs,
  buildRestPath,
  normalizeResponse,
  handleError,
} from "./utils";
export { Storage } from "./storage/interface";
export { FileStorage } from "./storage/file";
export { PGStorage, PGStorageConfig } from "./storage/pg";
export { BuiltinMethods } from "./builtin-methods";

import { Adapter } from "./adapter";
import { App, AdapterOptions } from "./types";

export function createSource({
  app,
  options,
}: {
  app?: App;
  options?: AdapterOptions;
} = {}) {
  return new Adapter(app, options);
}

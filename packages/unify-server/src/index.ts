export { RestMapper } from "./rest-mapper";
export {
  SourceConfig,
  EntityConfig,
  EntityMethod,
  QueryArgs,
  RestMethodMapping,
  RestMapperOptions,
  DEFAULT_METHOD_MAPPING,
} from "./types";
export {
  parseRequestArgs,
  buildRestPath,
  normalizeResponse,
  handleError,
} from "./utils";
export { Storage } from "./storage-interface";
export { FileStorage } from "./file-storage";
export { PGStorage, PGStorageConfig } from "./pg-storage";
export { BuiltinMethods } from "./builtin-methods";
export { createPgTablesFromConfig } from "./migrations";

import { RestMapper } from "./rest-mapper";
import { RestMapperOptions } from "./types";

export function createSource(options?: RestMapperOptions) {
  return new RestMapper(undefined, options);
}

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
export { FileStorage } from "./file-storage";
export { BuiltinMethods } from "./builtin-methods";

import { RestMapper } from "./rest-mapper";
import { RestMapperOptions } from "./types";

export function createSource(options?: RestMapperOptions) {
  return new RestMapper(undefined, options);
}

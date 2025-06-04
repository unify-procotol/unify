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

// 创建便捷的工厂函数
import { RestMapper } from "./rest-mapper";
import { SourceConfig, RestMapperOptions } from "./types";

/**
 * 创建一个新的 REST 映射器实例
 */
export function createRestMapper(options?: RestMapperOptions) {
  return new RestMapper(undefined, options);
}

/**
 * 快速创建并注册源的便捷函数
 */
export function createSource(
  config: SourceConfig,
  options?: RestMapperOptions
) {
  const mapper = new RestMapper(undefined, options);
  mapper.register(config);
  return mapper;
}

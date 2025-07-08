import { Fields } from "@unilab/urpc-core";

export class CacheEntity {
  @Fields.string({
    description: "The key of the cache",
  })
  key = "";

  @Fields.string({
    description: "The value of the cache",
  })
  value = "";
}

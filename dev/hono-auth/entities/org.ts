import { Fields } from "@unilab/urpc-core";

export class OrgEntity {
  @Fields.string({
    description: "The id of the org",
  })
  id = "";

  @Fields.string({
    description: "The name of the org",
  })
  name = "";

  @Fields.string({
    description: "The slug of the org",
  })
  slug = "";
}
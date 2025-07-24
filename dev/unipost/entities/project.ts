import { Fields } from "@unilab/urpc-core";

export class ProjectEntity {
  @Fields.number({
    description: "Project ID",
  })
  id = 0;

  @Fields.number({
    description: "User ID",
  })
  uid = 0;

  @Fields.string({
    description: "Project name",
  })
  name = "";

  @Fields.string({
    description: "Ghost API Key",
  })
  ghost_api_key = "";

  @Fields.string({
    description: "Ghost blog domain",
  })
  ghost_domain = "";

  @Fields.string({
    description: "Created at",
  })
  created_at = "";

  @Fields.string({
    description: "Updated at",
  })
  updated_at = "";

  @Fields.record(() => Locales)
  locales: Record<string, string> = {};
}

class Locales {
  @Fields.string({ description: "Locale code" })
  key = "";

  @Fields.string({ description: "Locale name" })
  value = "";
}

import { Fields } from "@unilab/urpc-core";

export class PostEntity {

  @Fields.number({
    description: "Post ID",
  })
  id = 0;

  @Fields.number({
    description: "Project Id",
  })
  project_id = 0;

  @Fields.string({
    description: "The title of the post",
  })
  title = "";

  @Fields.string({
    description: "The slug of the post",
  })
  slug = "";

  @Fields.string({
    description: "The content of the post",
  })
  content = ``;

  @Fields.string({
    description: "The i18n of the post",
  })
  i18n = {};

  @Fields.string({
    description: "The status of the post",
  })
  status = "pending";

  @Fields.string({
    description: "Created at",
  })
  created_at = "";

  @Fields.string({
    description: "Updated at",
  })
  updated_at = "";
}

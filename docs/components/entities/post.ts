import { Fields } from "@unilab/urpc-core";

export class PostEntity {
  @Fields.string()
  id = "";

  @Fields.string()
  name = "";

  @Fields.string()
  email = "";

  @Fields.string()
  role = "";

  @Fields.string()
  type = "";

  @Fields.string()
  category = "";

  @Fields.string()
  status = "";

  @Fields.boolean()
  isActive = true;

  @Fields.string()
  content = "";

  @Fields.string()
  imageUrl = "";

  @Fields.string()
  createdAt = "";

  @Fields.string()
  updatedAt = "";
}

import { Fields } from "@unilab/urpc-core";
  
export class NavListEntity {
  static displayName = "NavListEntity";

  @Fields.number({
    description: "The id of the navList",
    optional: true,
  })
  id = 0;
  
  @Fields.string({
    description: "The title of the navList",
    optional: true,
  })
  title = "";
  
  @Fields.string({
    description: "The url of the navList",
    optional: true,
  })
  url = "";
  
  @Fields.string({
    description: "The image of the navList",
    optional: true,
  })
  image = "";
  
  @Fields.string({
    description: "The description of the navList",
    optional: true,
  })
  description = "";
  
  @Fields.string({
    description: "The tag of the navList",
    optional: true,
  })
  tag = "";
  
  @Fields.boolean({
    description: "The done of the navList",
    optional: true,
  })
  done = false;
  
}
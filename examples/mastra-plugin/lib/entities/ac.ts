import { Fields } from "@unilab/urpc-core";

export class ACEntity {
  static displayName = "ACEntity";

  @Fields.string({
    description: "The unique identifier for the AC device",
  })
  id = "";

  @Fields.string({
    description: "The name of the AC device",
  })
  name = "";

  @Fields.boolean({
    description: "Whether the AC is turned on or off",
  })
  isOn = false;

  @Fields.number({
    description: "The temperature setting of the AC (16-30)",
  })
  temperature = 24;

  @Fields.string({
    description:
      "The operation mode of the AC, eg. 'cool', 'heat', 'fan', 'auto'",
  })
  mode = "cool";

  @Fields.string({
    description:
      "The fan speed setting of the AC, eg. 'low', 'medium', 'high', 'auto'",
  })
  fanSpeed = "medium";

  @Fields.string({
    optional: true,
    description: "The location where the AC is installed",
  })
  location = "";
}

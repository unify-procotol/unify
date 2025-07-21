import { Fields } from "@unilab/urpc-core";

export class LEDEntity {
  static displayName = "LEDEntity";

  @Fields.string({
    description: "The unique identifier for the LED device",
  })
  id = "";

  @Fields.string({
    description: "The name of the LED device",
  })
  name = "";

  @Fields.boolean({
    description: "Whether the LED is turned on or off",
  })
  isOn = false;

  @Fields.number({
    optional: true,
    description: "The brightness level of the LED (0-100)",
  })
  brightness = 100;

  @Fields.string({
    optional: true,
    description: "The location where the LED is installed",
  })
  location = "";
}

import { Fields } from "@unilab/urpc-core";

export class CompanyEntity {
  static displayName = "CompanyEntity";

  @Fields.string({
    description: "The name of the company",
  })
  name = '';

  @Fields.string({
    description: "The country of the company",
  })
  country = '';

  @Fields.string({
    description: "The webpage of the company",
  })
  webpage = '';

  @Fields.string({
    description: "The description of the company",
  })
  description = '';
}
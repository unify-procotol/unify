import { Fields } from "@unilab/urpc-core";

export class CompanyEntity {
  static displayName = "CompanyEntity";

  @Fields.string({
    description: "The name of the company",
  })
  name = '';
  
  @Fields.number({
    description: "The limit of the company",
  })
  limit?: number;

  @Fields.number({
    description: "The similarity of the company",
  })
  similarity?: number;

  @Fields.string({
    description: "The website of the company",
  })
  website = '';

  @Fields.string({
    description: "The country code of the company",
  })
  countryCode?: string;

  @Fields.string({
    description: "The city of the company",
  })
  city?: string;

  @Fields.string({
    description: "The size of the company",
  })
  size?: string;

  @Fields.string({
    description: "The type of the company",
  })
  type?: string;

  @Fields.string({
    description: "The linkedin url of the company",
  })
  linkedinUrl?: string;
}
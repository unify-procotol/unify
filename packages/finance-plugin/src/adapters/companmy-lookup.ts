import {
  BaseAdapter,
  ErrorCodes,
  FindOneArgs,
  URPCError,
} from "@unilab/urpc-core";
import { CompanyEntity } from "../entities/company";

export class CompanyLookupAdapter extends BaseAdapter<CompanyEntity> {
  static displayName = "CompanyLookupAdapter";

  async findCompanies(
    args: FindOneArgs<CompanyEntity>
  ): Promise<CompanyEntity[]> {
    const { name, limit = 5, similarity = 0.7 } = args.where;

    if (!process.env.RAPID_API_KEY) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "RAPID_API_KEY is not set");
    }

    if (!name) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "name is required");
    }

    const res = await fetch(
      `https://company-lookup-api.p.rapidapi.com/search?name=${name}}&require_domain=true&similarity=${similarity}&limit=${limit}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "company-lookup-api.p.rapidapi.com",
        },
      }
    ).then((res) => res.json());

    if (res.message) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, res.message);
    }
    if (res.length === 0) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "No companies found");
    }

    return res.map((company: any) => ({
      name: company.name,
      website: company.website,
      countryCode: company.country_code || '-',
      city: company.city || '-',
      size: company.size || '-',
      type: company.type || '-',
      linkedinUrl: company.linkedin_url || '-',
    }));
  }
}

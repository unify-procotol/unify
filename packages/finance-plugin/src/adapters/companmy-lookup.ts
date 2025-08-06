import {
  BaseAdapter,
  ErrorCodes,
  FindManyArgs,
  FindOneArgs,
  URPCError,
} from "@unilab/urpc-core";
import { CompanyEntity } from "../entities/company";

export class CompanyLookupAdapter extends BaseAdapter<CompanyEntity> {
  static displayName = "CompanyLookupAdapter";

  async findMany(args: FindManyArgs<CompanyEntity>): Promise<CompanyEntity[]> {
    const where = args.where;
    if (!where?.name) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "name is required");
    }

    const name = typeof where.name === "string" ? where.name : where.name.$eq;
    const limit = typeof where.limit === "number" ? where.limit : where.limit?.$eq || 5;
    const similarity = typeof where.similarity === "number" ? where.similarity : where.similarity?.$eq || 0.7;

    if (!name) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "name is required");
    }

    if (!process.env.RAPID_API_KEY) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "RAPID_API_KEY is not set");
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
      countryCode: company.country_code || "-",
      city: company.city || "-",
      size: company.size || "-",
      type: company.type || "-",
      linkedinUrl: company.linkedin_url || "-",
    }));
  }
}

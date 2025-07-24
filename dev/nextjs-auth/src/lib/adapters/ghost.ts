import { BaseAdapter, FindManyArgs, FindOneArgs } from "@unilab/urpc-core";
import { PostEntity } from "../entities/post";

const mockData = [
  {
    slug: "hello-world",
    title: "Hello World",
    content: "This is a test post",
    authorId: "1",
  },
];

export class GhostAdapter extends BaseAdapter<PostEntity> {
  async findMany(args: FindManyArgs<PostEntity>): Promise<PostEntity[]> {
    const _slug = args.where?.slug;
    const slug = typeof _slug === "string" ? _slug : _slug?.$eq;
    if (slug) {
      return mockData.filter((post) => post.slug === slug);
    }
    return mockData;
  }

  async findOne(args: FindOneArgs<PostEntity>): Promise<PostEntity | null> {
    const slug = args.where?.slug;
    if (slug) {
      return mockData.find((post) => post.slug === slug) || null;
    }
    return null;
  }
}

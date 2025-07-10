import { CreationArgs } from "@unilab/urpc-core";
import { ProjectEntity } from "../entities/project";
import { getPosts } from "../libs/ghost";
import { PostgresAdapter, PostgresAdapterConfig } from "./postgres";
import { PostAdapter } from "./post";


export class ProjectAdapter extends PostgresAdapter<ProjectEntity> {
  constructor(config: Omit<PostgresAdapterConfig, 'tableName'> = {}) {
    super({
      ...config,
      tableName: 'projects'
    });
  }

  async create(args: CreationArgs<ProjectEntity>): Promise<ProjectEntity> {
    const result = await super.create(args);

    const ghostPosts = await getPosts(result.ghost_api_key, result.ghost_domain);
    const post = new PostAdapter();
    for (const ghostPost of ghostPosts) {
      await post.create({
        data: {
          title: ghostPost.title,
          content: ghostPost.html,
          project_id: result.id,
        },
      });
    }
    return result;
  }
}

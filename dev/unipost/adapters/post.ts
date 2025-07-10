import { PostEntity } from "../entities/post";
import { PostgresAdapter, PostgresAdapterConfig } from "./postgres";


export class PostAdapter extends PostgresAdapter<PostEntity> {
  constructor(config: Omit<PostgresAdapterConfig, 'tableName'> = {}) {
    super({
      ...config,
      tableName: 'posts'
    });
  }
}

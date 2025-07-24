import { Plugin } from "@unilab/urpc-core";
import { logging } from "@unilab/urpc-core/middleware";
import { URPC } from "@unilab/urpc-hono";
import { PostAdapter } from "./adapters/post";
import { ProjectAdapter } from "./adapters/project";
import { PostEntity } from "./entities/post";
import { ProjectEntity } from "./entities/project";
import { gptTranslation } from "./libs/i18n";

const PostgresPlugin: Plugin = {
  entities: [ProjectEntity, PostEntity],
  adapters: [
    {
      source: "postgres",
      entity: "ProjectEntity",
      adapter: new ProjectAdapter(),
    },
    {
      source: "postgres",
      entity: "PostEntity",
      adapter: new PostAdapter(),
    },
  ],
};

const app = URPC.init({
  plugins: [PostgresPlugin],
  middlewares: [logging()],
  entityConfigs: {
    project: {
      defaultSource: "postgres",
    },
  },
});

app.get("/process", async (c) => {
  const postEntity = new PostAdapter();
  const projectEntity = new ProjectAdapter();

  const pendingPosts = await postEntity.findOne({
    where: {
      status: "pending",
    },
  });

  if (!pendingPosts) {
    return c.json({
      stats: "no pending posts",
    });
  }

  const project = await projectEntity.findOne({
    where: {
      id: pendingPosts.project_id,
    },
  });

  const i18n = await gptTranslation(
    pendingPosts.title,
    pendingPosts.content,
    Object.keys(project!.locales)
  );

  await postEntity.update({
    where: {
      id: pendingPosts.id,
    },
    data: {
      i18n, 
      status: "translated",
    },
  });

  return c.json({
    stats: "done",
  });
});

export default {
  port: 3000,
  timeout: 30000,
  fetch: app.fetch,
};

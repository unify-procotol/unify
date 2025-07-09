import { repo, URPC, joinRepo } from "@unilab/urpc-client";
import { PostEntity } from "./entities/post";
import { UserEntity } from "./entities/user";
import { CacheEntity } from "./entities/cache";
import { LLMEntity } from "./entities/llm";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const demo = async () => {
  // await repo<CacheEntity>({
  //   entity: "cache",
  //   source: "memory",
  // }).create({
  //   data: {
  //     key: "test",
  //     value: "test value",
  //   },
  // });

  // const cache = await repo<CacheEntity>({
  //   entity: "cache",
  //   source: "memory",
  // }).findOne({ where: { key: "test" } });
  // console.log("cache=>", cache);

  // const result = await repo<LLMEntity>({
  //   entity: "llm",
  //   source: "openrouter",
  // }).create({
  //   data: {
  //     model: "openai/gpt-4",
  //     prompt: "Hello, how are you?",
  //   },
  // });
  // console.log("result=>", result);

  const posts = await repo<PostEntity>({
    entity: "post",
    // source: "ghost",
    context: { lang: "zh" }, //zh,ja,ko,fr,de,es,ru,pt
  }).findOne({
    where: {
      slug: "hello-world",
    },
    include: {
      author: async (post) =>
        repo<UserEntity>({
          entity: "UserEntity",
          source: "ghost",
        }).findOne({ where: { id: post.authorId } }),
    },
  });
  console.log("posts=>", posts);
};

demo();

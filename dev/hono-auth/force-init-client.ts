import { repo, URPC } from "@unilab/urpc";

URPC.init({
  baseUrl: "http://localhost:9000",
  timeout: 10000,
});

const demo = async () => {
  try {
    const user = await repo({
      entity: "user",
      source: "ghost",
    }).findOne({
      where: {
        id: "1",
      },
    });

    console.log("user=>", user);
  } catch (error: any) {
    console.log("Expected error:", error.message);
  }

  try {
    const post = await repo({
      entity: "post",
      source: "ghost",
    }).findOne({
      where: {
        slug: "hello-world",
      },
    });

    console.log("post=>", post);
  } catch (error: any) {
    console.log("Expected error:", error.message);
  }
};

demo();

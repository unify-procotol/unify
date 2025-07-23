import { repo, URPC } from "@unilab/urpc";
import { PostEntity } from "./entities/post";
import { generateToken } from "./jwt";

const token = generateToken({
  id: "1",
  name: "Jane",
  avatar: "https://example.com/avatar.png",
  email: "test@test.com",
  roles: ["admin"],
});

console.log("token=>", token);

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
  // headers: {
  //   Authorization: `Bearer ${token}`,
  // },
});

URPC.setHeaders({
  Authorization: `Bearer ${token}`,
});

const demo = async () => {
  try {
    const posts = await repo<PostEntity>({
      entity: "post",
      source: "ghost",
    }).findOne({
      where: {
        slug: "hello-world",
      },
    });
    console.log("Unexpected success:", posts);
  } catch (error: any) {
    console.log("Expected error:", error.message);
  }
};

demo();

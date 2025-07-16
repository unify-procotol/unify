import { ChatEntity } from "@unilab/mastra-plugin/entities";
import { UserEntity } from "./entities/user";
import { repo, URPC } from "@unilab/urpc";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

// const fetchUser = async () => {
//   const result = await repo<UserEntity>({
//     entity: "UserEntity",
//     source: "call-stream-test",
//     context: {
//       stream: true,
//     },
//   }).call({
//     name: "John Doe",
//   });

//   if (result instanceof Response) {
//     const reader = result.body?.getReader();
//     if (reader) {
//       while (true) {
//         const readResult = await reader.read();
//         if (readResult.done) break;
//         console.log("[stream value]:", readResult.value);
//       }
//     }
//   } else {
//     console.log("[json result]:", result);
//   }
// };

// fetchUser();

const testAgent = async () => {
  const result = await repo<ChatEntity>({
    entity: "chat",
    source: "mastra",
    // context: {
    //   stream: true,
    // },
  }).call({
    // input: "Find all users, source is mock",
    input: "Find all users",
    model: "google/gemini-2.0-flash-001",
  });

  if (result instanceof Response) {
    const reader = result.body?.getReader();
    if (reader) {
      let resultText = "";

      while (true) {
        const readResult = await reader.read();
        if (readResult.done) break;
        // console.log("[stream value]:", readResult.value);
        const text = new TextDecoder().decode(readResult.value);
        console.log("[stream text]:", text);
        resultText += text;
      }
      console.log("[result text]:", resultText);
    }
  } else {
    console.log("[json result]:", result);
  }
};

testAgent();

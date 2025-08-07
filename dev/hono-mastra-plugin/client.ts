import { ChatEntity } from "@unilab/mastra-plugin/entities";
import { UserEntity } from "./entities/user";
import { repo, URPC } from "@unilab/urpc";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 100000,
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
//         const text = new TextDecoder().decode(readResult.value);
//         console.log("[stream text]:", text);
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
    context: {
      // stream: true,
      // summary: true,
      // analysis: true,
    },
  }).call({
    entities: ["UserEntity"], // ["WeatherEntity", "GeocodingEntity"],
    input: "Find all users",
    // input: "What are the coordinates of London?",
    // input: "What's the weather like in London?",
    // input: "What is the price of the token with the contract address 0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0?",
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
      // console.log("[result text]:", resultText);
    }
  } else {
    console.log("[json result]:", result);
  }
};

testAgent();

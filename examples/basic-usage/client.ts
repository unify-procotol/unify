import { createClient } from "@unify/client";
import { BasicUsageSourceConfig } from "./config";

const client = createClient(BasicUsageSourceConfig, {
  baseURL: "http://localhost:3000",
});

async function demo() {
  try {
    const findManyRes = await client.user.findMany({
      order_by: {
        id: "desc",
      },
    });
    console.log("findMany=>", findManyRes.data);

    const findOneRes = await client.user.findOne({
      where: {
        id: 1,
      },
      select: ["id", "name"],
    });
    console.log("findOne=>", findOneRes.data);

    // ----------------------------------------

    // await client.user_table.create({
    //   data: {
    //     id: 1,
    //     name: "test",
    //     age: 18,
    //   },
    // });

    const tableUserFindManyRes = await client.user_table.findMany({
      select: ["id", "name"],
    });
    console.log("tableUserFindMany=>", tableUserFindManyRes.data);

    const tableUserFindOneRes = await client.user_table.findOne({
      where: {
        id: 1,
      },
    });
    console.log("tableUserFindOne=>", tableUserFindOneRes.data);

    // const tableUserUpdateRes = await client.user_table.update({
    //   where: {
    //     id: 1,
    //   },
    //   data: {
    //     name: "test1",
    //   },
    // });
    // console.log("tableUserUpdate=>", tableUserUpdateRes.data);
  } catch (error) {
    console.log("❌ 错误:", error.message);
  }
}

demo();

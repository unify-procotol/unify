import { PostEntity } from "../hono-basic/entities/post";
import { UserEntity } from "../hono-basic/entities/user";
import { WalletEntity } from "@unify/uniweb3/entities";
import {
  classToAST,
  astToJsonString,
  astToTypeScriptCode,
} from "./utils/ast-converter";

// 测试 PostEntity 类转换为 AST
function testPostEntityToAST() {
  console.log("=== PostEntity 类转换为 AST 测试 ===");

  // 转换为类 AST
  const classAST = classToAST(PostEntity);
  console.log("PostEntity Class AST:");
  console.log(astToJsonString(classAST));

  console.log("\n转换为 TypeScript 代码:");
  console.log(astToTypeScriptCode(classAST));

  console.log("\n" + "=".repeat(50) + "\n");
}

// 测试 UserEntity 转换为接口 AST
function testUserEntityToInterfaceAST() {
  console.log("=== UserEntity 转换为 Interface AST 测试 ===");

  // 转换为接口 AST
  const classAST = classToAST(UserEntity);
  console.log("UserEntity TypeScript AST:");
  console.log(astToJsonString(classAST));

  console.log("\n转换为 TypeScript 代码:");
  console.log(astToTypeScriptCode(classAST));

  console.log("\n" + "=".repeat(50) + "\n");
}

// 运行所有测试
function runAllTests() {
  testPostEntityToAST();
  testUserEntityToInterfaceAST();
}

// 如果直接运行此文件
if (require.main === module) {
  runAllTests();
}

export { runAllTests };

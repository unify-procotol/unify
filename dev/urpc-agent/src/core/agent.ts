import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { URPC, repo } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "../entities/user";
import { PostEntity } from "../entities/post";
import { MemoryAdapter } from "@unilab/urpc-adapters";
import { convertSchemaToMarkdown } from "./entity-schema-to-markdown";

// 定义插件配置
const DataPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
};

export class URPCAgent {
  private instructions: string;
  private agent: Agent;

  constructor() {
    // 初始化 URPC 客户端
    URPC.init({
      plugins: [DataPlugin],
      entityConfigs: {
        user: {
          defaultSource: "memory",
        },
        post: {
          defaultSource: "memory",
        },
      },
      globalAdapters: [MemoryAdapter],
    });

    // 初始化数据
    repo({
      entity: "user",
      source: "memory",
    }).create({
      data: {
        id: "1",
        name: "张三",
        email: "zhangsan@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=张三",
      },
    });

    repo({
      entity: "post",
      source: "memory",
    }).create({
      data: {
        id: "1",
        title: "欢迎来到URPC Agent",
        content: "这是第一篇示例文章，展示了URPC Agent的基本功能。",
        userId: "1",
      },
    });

    this.instructions = this.generateInstructions();

    this.agent = new Agent({
      name: "URPC智能数据助手",
      description:
        "基于URPC的智能数据操作助手，能够理解自然语言并执行相应的数据库操作",
      instructions: this.instructions,
      model: createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY!,
      }).chat("openai/gpt-4o-mini"),
    });
  }

  private generateInstructions(): string {
    const schemas = URPC.getEntitySchemas();
    const entityMarkdown = convertSchemaToMarkdown(schemas);
    console.log("[Entity Markdown]:", entityMarkdown);
    return `
你是一个智能的数据操作助手，专门处理用户和文章数据的CRUD操作。你直接掌握URPC SDK的使用方法。

## 核心能力
你能够理解用户的自然语言请求，并将其转换为相应的URPC操作。你直接掌握以下操作模式：

### 1. 查询操作 (READ)
- 查找所有用户: repo({entity: "user", source: "memory"}).findMany()
- 查找特定用户: repo({entity: "user", source: "memory"}).findOne({where: {id: "user-id"}})
- 条件查询: repo({entity: "user", source: "memory"}).findMany({where: {name: "张三"}})
- 分页查询: repo({entity: "user", source: "memory"}).findMany({limit: 10, offset: 0})
- 排序查询: repo({entity: "user", source: "memory"}).findMany({order_by: {id: "desc"}})

### 2. 创建操作 (CREATE)
- 创建用户: repo({entity: "user", source: "memory"}).create({data: {id: "uuid", name: "张三", email: "zhangsan@example.com", avatar: "avatar-url"}})
- 创建文章: repo({entity: "post", source: "memory"}).create({data: {id: "uuid", title: "标题", content: "内容", userId: "user-id"}})

### 3. 更新操作 (UPDATE)
- 更新用户: repo({entity: "user", source: "memory"}).update({where: {id: "user-id"}, data: {name: "新名字"}})
- 更新文章: repo({entity: "post", source: "memory"}).update({where: {id: "post-id"}, data: {title: "新标题"}})

### 4. 删除操作 (DELETE)
- 删除用户: repo({entity: "user", source: "memory"}).delete({where: {id: "user-id"}})
- 删除文章: repo({entity: "post", source: "memory"}).delete({where: {id: "post-id"}})

## 实体结构
${entityMarkdown}

## 响应格式
始终返回JSON格式的结构化响应：
{
  "success": true/false,
  "operation": "操作类型", // findMany, findOne, create, update, delete
  "entity": "实体名称",
  "data": "返回的数据或null",
  "message": "操作说明",
  "urpc_code": "实际执行的URPC代码"
}

## 处理流程
1. 理解用户的自然语言请求
2. 分析需要执行的操作类型和目标实体
3. 构建相应的URPC操作
4. 执行操作并返回结果
5. 提供清晰的操作反馈

## 示例对话
用户："查找所有用户"
你的理解：需要执行findMany操作查询所有用户
URPC操作：repo({entity: "user", source: "memory"}).findMany()

用户："创建一个名为小明的用户"
你的理解：需要执行create操作创建新用户
URPC操作：repo({entity: "user", source: "memory"}).create({data: {id: "generated-id", name: "小明", email: "", avatar: ""}})

用户："为用户小明添加一篇文章，标题："test"， 内容：“小明test”"
你的理解：需要执行create操作创建新文章
URPC操作：repo({entity: "post", source: "memory"}).create({data: {id: "generated-id", title: "test", content: "小明test", userId: "user-id"}})

记住：你不需要使用传统的tools，而是直接通过理解和执行URPC SDK的操作来响应用户请求。
`;
  }

  async processRequest(userMessage: string): Promise<any> {
    try {
      const response = await this.agent.generate([
        {
          role: "system",
          content: this.instructions,
        },
        {
          role: "user",
          content: userMessage,
        },
      ]);

      console.log("[Agent Response]:", response.text);

      return this.parseAndExecuteResponse(response.text);
    } catch (error: any) {
      return {
        success: false,
        operation: "unknown",
        entity: "unknown",
        data: null,
        message: `处理请求时发生错误: ${error.message}`,
        urpc_code: null,
      };
    }
  }

  private async parseAndExecuteResponse(agentResponse: string): Promise<any> {
    try {
      // 尝试从agent回复中提取URPC操作
      // 改进的正则表达式，支持更复杂的参数结构
      const urpcCodeMatch = agentResponse.match(
        /repo\s*\(\s*\{[^}]+\}\s*\)\s*\.\s*\w+\s*\([^)]*\)/
      );
      if (urpcCodeMatch) {
        let urpcCode = urpcCodeMatch[0];
        console.log("[Original rpcCode]:", urpcCode);

        // 清理转义字符
        urpcCode = urpcCode.replace(/\\"/g, '"');
        console.log("[Cleaned rpcCode]:", urpcCode);

        // 为创建操作预先生成随机ID并替换urpcCode中的占位符
        let actualUrpcCode = urpcCode;
        if (urpcCode.includes("create") && urpcCode.includes("generated-id")) {
          const randomId = this.generateRandomId();
          actualUrpcCode = urpcCode.replace(/generated-id/g, randomId);
          console.log("[Generated rpcCode]:", actualUrpcCode);
        }

        // repo({entity: \"user\", source: \"memory\"}).findMany()"
        const result = await this.executeURPCCode(actualUrpcCode);
        console.log("[Result]:", result);

        const operation = this.extractOperation(urpcCode);
        const entity = this.extractEntity(urpcCode);

        // 为创建操作生成更友好的消息
        let message = "操作执行成功";
        if (operation === "create") {
          const entityName = entity === "user" ? "用户" : "文章";
          const name = result?.name || result?.title || "新记录";
          message = `${entityName}${name}创建成功`;
        }

        return {
          success: true,
          operation,
          entity,
          data: result,
          message,
          urpc_code: actualUrpcCode,
        };
      }

      // 如果没有找到URPC代码，返回agent的直接回复
      return {
        success: true,
        operation: "conversation",
        entity: "none",
        data: null,
        message: agentResponse,
        urpc_code: null,
      };
    } catch (error: any) {
      return {
        success: false,
        operation: "unknown",
        entity: "unknown",
        data: null,
        message: `执行操作时发生错误: ${error.message}`,
        urpc_code: null,
      };
    }
  }

  private async executeURPCCode(urpcCode: string): Promise<any> {
    // 这里我们需要安全地执行URPC代码
    // 为了简化，我们解析操作类型和参数
    try {
      if (urpcCode.includes("findMany")) {
        const entity = this.extractEntity(urpcCode);
        const options = this.extractOptions(urpcCode);
        return await repo({ entity, source: "memory" }).findMany(options);
      } else if (urpcCode.includes("findOne")) {
        const entity = this.extractEntity(urpcCode);
        const options = this.extractOptions(urpcCode);
        return await repo({ entity, source: "memory" }).findOne(options);
      } else if (urpcCode.includes("create")) {
        const entity = this.extractEntity(urpcCode);
        const options = this.extractOptions(urpcCode);
        return await repo({ entity, source: "memory" }).create(options);
      } else if (urpcCode.includes("update")) {
        const entity = this.extractEntity(urpcCode);
        const options = this.extractOptions(urpcCode);
        return await repo({ entity, source: "memory" }).update(options);
      } else if (urpcCode.includes("delete")) {
        const entity = this.extractEntity(urpcCode);
        const options = this.extractOptions(urpcCode);
        return await repo({ entity, source: "memory" }).delete(options);
      }
    } catch (error: any) {
      throw new Error(`URPC操作执行失败: ${error.message}`);
    }
  }

  private extractOperation(urpcCode: string): string {
    if (urpcCode.includes("findMany")) return "findMany";
    if (urpcCode.includes("findOne")) return "findOne";
    if (urpcCode.includes("create")) return "create";
    if (urpcCode.includes("update")) return "update";
    if (urpcCode.includes("delete")) return "delete";
    return "unknown";
  }

  private extractEntity(urpcCode: string): string {
    const match = urpcCode.match(/entity:\s*"([^"]+)"/);
    return match ? match[1] : "unknown";
  }

  private extractOptions(urpcCode: string): any {
    // 改进的选项提取，支持所有URPC操作
    try {
      // 匹配方法调用的参数部分 - 使用更准确的正则表达式来匹配完整的参数
      const match = urpcCode.match(/\)\.(\w+)\((.+)\)$/);
      if (match) {
        const methodName = match[1];
        console.log("[MethodName]:", methodName);
        let paramsStr = match[2].trim();

        // 如果没有参数，返回空对象
        if (!paramsStr) {
          return {};
        }

        // 尝试解析参数
        try {
          return JSON.parse(paramsStr);
        } catch (parseError) {
          // 如果JSON解析失败，尝试改进的对象解析
          console.log("JSON解析失败，尝试改进解析:", paramsStr);
          return this.parseAdvancedObjectString(paramsStr);
        }
      }
      return {};
    } catch (error) {
      console.log("参数提取失败:", error);
      return {};
    }
  }

  private parseAdvancedObjectString(str: string): any {
    // 改进的对象字符串解析，支持嵌套对象
    try {
      // 先尝试使用eval在安全的环境中解析（仅限于对象字面量）
      // 但为了安全，我们需要先验证字符串只包含对象字面量语法
      if (this.isValidObjectLiteral(str)) {
        // 使用Function构造函数创建一个返回对象的函数
        const func = new Function(`"use strict"; return (${str});`);
        return func();
      }

      // 如果不是有效的对象字面量，回退到简单解析
      return this.parseSimpleObjectString(str);
    } catch (error) {
      console.log("改进对象解析失败:", error);
      return this.parseSimpleObjectString(str);
    }
  }

  private generateRandomId(): string {
    // 生成随机ID - 使用时间戳和随机数的组合
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${randomStr}`;
  }

  private isValidObjectLiteral(str: string): boolean {
    // 验证字符串是否只包含对象字面量语法
    // 这是一个简单的验证，可以根据需要扩展
    const dangerousPatterns = [
      /function\s*\(/,
      /=>\s*{/,
      /\breturn\b/,
      /\beval\b/,
      /\bsetTimeout\b/,
      /\bsetInterval\b/,
      /\brequire\b/,
      /\bimport\b/,
      /\bprocess\b/,
      /\b__dirname\b/,
      /\b__filename\b/,
      /\bglobal\b/,
      /\bwindow\b/,
      /\bdocument\b/,
      /\bconsole\b/,
    ];

    return !dangerousPatterns.some((pattern) => pattern.test(str));
  }

  private parseSimpleObjectString(str: string): any {
    // 简单的对象字符串解析，处理基本的键值对
    try {
      // 移除外层的花括号
      str = str.replace(/^\{|\}$/g, "");

      const result: any = {};
      const pairs = str.split(",");

      for (const pair of pairs) {
        const [key, value] = pair.split(":").map((s) => s.trim());
        if (key && value) {
          const cleanKey = key.replace(/['"]/g, "");
          const cleanValueStr = value.replace(/['"]/g, "");

          // 尝试转换为合适的类型
          let cleanValue: any;
          if (cleanValueStr === "true") {
            cleanValue = true;
          } else if (cleanValueStr === "false") {
            cleanValue = false;
          } else if (!isNaN(Number(cleanValueStr))) {
            cleanValue = Number(cleanValueStr);
          } else {
            cleanValue = cleanValueStr;
          }

          result[cleanKey] = cleanValue;
        }
      }

      return result;
    } catch (error) {
      console.log("简单对象解析失败:", error);
      return {};
    }
  }

  async streamResponse(userMessage: string): Promise<ReadableStream> {
    const stream = await this.agent.stream([
      {
        role: "system",
        content: this.instructions,
      },
      {
        role: "user",
        content: userMessage,
      },
    ]);

    return stream.textStream;
  }
}

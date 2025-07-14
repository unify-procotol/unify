import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { URPC, repo } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "../entities/user";
import { PostEntity } from "../entities/post";
import { MemoryAdapter } from "@unilab/urpc-adapters";
import { convertSchemaToMarkdown } from "./entity-schema-to-markdown";

// Define plugin configuration
const DataPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
};

export class URPCAgent {
  private instructions: string;
  private agent: Agent;

  constructor() {
    // Initialize URPC client
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

    // Initialize data
    repo({
      entity: "user",
      source: "memory",
    }).create({
      data: {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe",
      },
    });

    repo({
      entity: "post",
      source: "memory",
    }).create({
      data: {
        id: "1",
        title: "Welcome to URPC Agent",
        content:
          "This is the first sample article, demonstrating the basic functionality of URPC Agent.",
        userId: "1",
      },
    });

    this.instructions = this.generateInstructions();

    this.agent = new Agent({
      name: "URPC Smart Data Assistant",
      description:
        "An intelligent data operation assistant based on URPC, capable of understanding natural language and executing corresponding database operations",
      instructions: this.instructions,
      model: createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY!,
      }).chat("openai/gpt-4o"),
      // .chat("anthropic/claude-3.7-sonnet"),
    });
  }

  private generateInstructions(): string {
    const schemas = URPC.getEntitySchemas();
    console.log("[Schemas]:", JSON.stringify(schemas, null, 2));
    const entityMarkdown = convertSchemaToMarkdown(schemas);
    console.log("[Entity Markdown]:", entityMarkdown);
    return `
You are an intelligent data operation assistant specialized in handling CRUD operations for user and article data. You have direct mastery of URPC SDK usage.

## Core Capabilities
You can understand users' natural language requests and convert them into corresponding URPC operations. You directly master the following operation patterns:

### 1. Query Operations (READ)
- Find all users: repo({entity: "user", source: "memory"}).findMany()
- Find specific user: repo({entity: "user", source: "memory"}).findOne({where: {id: "user-id"}})
- Conditional query: repo({entity: "user", source: "memory"}).findMany({where: {name: "Zhang San"}})
- Paginated query: repo({entity: "user", source: "memory"}).findMany({limit: 10, offset: 0})
- Sorted query: repo({entity: "user", source: "memory"}).findMany({order_by: {id: "desc"}})

### 2. Create Operations (CREATE)
- Create user: repo({entity: "user", source: "memory"}).create({data: {id: "uuid", name: "Zhang San", email: "zhangsan@example.com", avatar: "avatar-url"}})
- Create article: repo({entity: "post", source: "memory"}).create({data: {id: "uuid", title: "Title", content: "Content", userId: "user-id"}})

### 3. Update Operations (UPDATE)
- Update user: repo({entity: "user", source: "memory"}).update({where: {id: "user-id"}, data: {name: "New Name"}})
- Update article: repo({entity: "post", source: "memory"}).update({where: {id: "post-id"}, data: {title: "New Title"}})

### 4. Delete Operations (DELETE)
- Delete user: repo({entity: "user", source: "memory"}).delete({where: {id: "user-id"}})
- Delete article: repo({entity: "post", source: "memory"}).delete({where: {id: "post-id"}})

## Entity Structure
${entityMarkdown}

## Response Format
Always return JSON formatted structured response:
{
  "success": true/false,
  "operation": "operation type", // findMany, findOne, create, update, delete
  "entity": "entity name",
  "data": "returned data or null",
  "message": "operation description",
  "urpc_code": "actual executed URPC code"
}

## Processing Flow
1. Understand user's natural language request
2. Analyze the operation type and target entity to execute
3. Build corresponding URPC operation
4. Execute operation and return result
5. Provide clear operation feedback

## Example Dialogue
User: "Find all users"
Your understanding: Need to execute findMany operation to query all users
URPC operation: repo({entity: "user", source: "memory"}).findMany()

User: "Create a user named Xiao Ming"
Your understanding: Need to execute create operation to create new user
URPC operation: repo({entity: "user", source: "memory"}).create({data: {id: "generated-id", name: "Xiao Ming", email: "", avatar: ""}})

User: "Add an article for user Xiao Ming, title: 'test', content: 'Xiao Ming test'"
Your understanding: Need to execute create operation to create new article
URPC operation: repo({entity: "post", source: "memory"}).create({data: {id: "generated-id", title: "test", content: "Xiao Ming test", userId: "user-id"}})

Remember: You don't need to use traditional tools, but directly respond to user requests through understanding and executing URPC SDK operations.
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
        message: `Error occurred while processing request: ${error.message}`,
        urpc_code: null,
      };
    }
  }

  private async parseAndExecuteResponse(agentResponse: string): Promise<any> {
    try {
      // Try to extract URPC operation from agent response
      // Improved regex that supports more complex parameter structures
      const urpcCodeMatch = agentResponse.match(
        /repo\s*\(\s*\{[^}]+\}\s*\)\s*\.\s*\w+\s*\([^)]*\)/
      );
      if (urpcCodeMatch) {
        let urpcCode = urpcCodeMatch[0];
        console.log("[Original rpcCode]:", urpcCode);

        // Clean escape characters
        urpcCode = urpcCode.replace(/\\"/g, '"');
        console.log("[Cleaned rpcCode]:", urpcCode);

        // Pre-generate random ID for create operations and replace placeholders in urpcCode
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

        // Generate more friendly message for create operations
        let message = "Operation executed successfully";
        if (operation === "create") {
          const entityName = entity === "user" ? "User" : "Article";
          const name = result?.name || result?.title || "New record";
          message = `${entityName} ${name} created successfully`;
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

      // If no URPC code found, return agent's direct reply
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
        message: `Error occurred while executing operation: ${error.message}`,
        urpc_code: null,
      };
    }
  }

  private async executeURPCCode(urpcCode: string): Promise<any> {
    // Here we need to safely execute URPC code
    // For simplification, we parse operation types and parameters
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
      throw new Error(`URPC operation execution failed: ${error.message}`);
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
    // Improved option extraction, supporting all URPC operations
    try {
      // Match parameter part of method call - use more accurate regex to match complete parameters
      const match = urpcCode.match(/\)\.(\w+)\((.+)\)$/);
      if (match) {
        const methodName = match[1];
        console.log("[MethodName]:", methodName);
        let paramsStr = match[2].trim();

        // If no parameters, return empty object
        if (!paramsStr) {
          return {};
        }

        // Try to parse parameters
        try {
          return JSON.parse(paramsStr);
        } catch (parseError) {
          // If JSON parsing fails, try improved object parsing
          console.log(
            "JSON parsing failed, trying improved parsing:",
            paramsStr
          );
          return this.parseAdvancedObjectString(paramsStr);
        }
      }
      return {};
    } catch (error) {
      console.log("Parameter extraction failed:", error);
      return {};
    }
  }

  private parseAdvancedObjectString(str: string): any {
    // Improved object string parsing, supporting nested objects
    try {
      // First try to parse using eval in a safe environment (limited to object literals only)
      // But for security, we need to first validate that the string contains only object literal syntax
      if (this.isValidObjectLiteral(str)) {
        // Use Function constructor to create a function that returns an object
        const func = new Function(`"use strict"; return (${str});`);
        return func();
      }

      // If not a valid object literal, fall back to simple parsing
      return this.parseSimpleObjectString(str);
    } catch (error) {
      console.log("Improved object parsing failed:", error);
      return this.parseSimpleObjectString(str);
    }
  }

  private generateRandomId(): string {
    // Generate random ID - using combination of timestamp and random number
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${randomStr}`;
  }

  private isValidObjectLiteral(str: string): boolean {
    // Validate whether string contains only object literal syntax
    // This is a simple validation that can be extended as needed
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
    // Simple object string parsing, handling basic key-value pairs
    try {
      // Remove outer braces
      str = str.replace(/^\{|\}$/g, "");

      const result: any = {};
      const pairs = str.split(",");

      for (const pair of pairs) {
        const [key, value] = pair.split(":").map((s) => s.trim());
        if (key && value) {
          const cleanKey = key.replace(/['"]/g, "");
          const cleanValueStr = value.replace(/['"]/g, "");

          // Try to convert to appropriate type
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
      console.log("Simple object parsing failed:", error);
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

import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { URPC, repo } from "@unilab/urpc";
import { convertSchemaToMarkdown } from "./entity-schema-to-markdown";
import { convertEntitySourcesToMarkdown } from "./entity-source-to-markdown";

export interface URPCAgentOptions {
  name?: string;
  description?: string;
  model?: string;
  openrouterApiKey?: string;
  debug?: boolean;
}

export class URPCAgent {
  private instructions: string;
  private agent: Agent;
  private debug: boolean;

  constructor({
    name = "URPC Smart Data Assistant",
    description = "An intelligent data operation assistant based on URPC, capable of understanding natural language and executing corresponding database operations",
    model = "openai/gpt-4o-mini",
    openrouterApiKey,
    debug = false,
  }: URPCAgentOptions = {}) {
    this.debug = debug;
    this.instructions = this.generateInstructions();

    this.agent = new Agent({
      name,
      description,
      instructions: this.instructions,
      model: createOpenRouter({
        apiKey: openrouterApiKey || process.env.OPENROUTER_API_KEY,
      }).chat(model),
    });
  }

  private generateInstructions(): string {
    const schemas = URPC.getEntitySchemas();
    const entitySources = URPC.getEntitySources();
    const entityMarkdown = convertSchemaToMarkdown(schemas);
    const entitySourcesMarkdown = convertEntitySourcesToMarkdown(entitySources);

    if (this.debug) {
      console.log("[Schemas]:\n", JSON.stringify(schemas, null, 2));
      console.log("[Entity Markdown]:\n", entityMarkdown);
      console.log("[Entity Sources Markdown]:\n", entitySourcesMarkdown);
    }

    return `
You are an intelligent data operation assistant specialized in handling CRUD operations for user and article data. You have direct mastery of URPC SDK usage.

## Entity Structure

${entityMarkdown}

## Entity Supported Sources
${entitySourcesMarkdown}

## Entity Name Mapping
When users mention "users" or "user", use entity: "user"
When users mention "posts", "articles", or "post", use entity: "post"

## Core Capabilities
You can understand users' natural language requests and convert them into corresponding URPC operations. You directly master the following operation patterns:

### 1. Query Operations (READ)
- Find all users: repo({entity: "user", source: "[select from supported sources]"}).findMany()
- Find specific user: repo({entity: "user", source: "[select from supported sources]"}).findOne({where: {id: "user-id"}})
- Conditional query: repo({entity: "user", source: "[select from supported sources]"}).findMany({where: {name: "jack"}})
- Paginated query: repo({entity: "user", source: "[select from supported sources]"}).findMany({limit: 10, offset: 0})
- Sorted query: repo({entity: "user", source: "[select from supported sources]"}).findMany({order_by: {id: "desc"}})

### 2. Create Operations (CREATE)
- Create user: repo({entity: "user", source: "[select from supported sources]"}).create({data: {id: "uuid", name: "jack", email: "jack@example.com", avatar: "avatar-url"}})
- Create article: repo({entity: "post", source: "[select from supported sources]"}).create({data: {id: "uuid", title: "Title", content: "Content", userId: "user-id"}})

### 3. Update Operations (UPDATE)
- Update user: repo({entity: "user", source: "[select from supported sources]"}).update({where: {id: "user-id"}, data: {name: "New Name"}})
- Update article: repo({entity: "post", source: "[select from supported sources]"}).update({where: {id: "post-id"}, data: {title: "New Title"}})

### 4. Delete Operations (DELETE)
- Delete user: repo({entity: "user", source: "[select from supported sources]"}).delete({where: {id: "user-id"}})
- Delete article: repo({entity: "post", source: "[select from supported sources]"}).delete({where: {id: "post-id"}})

## IMPORTANT: Response Format
You MUST respond with natural language that includes the actual URPC code to be executed. 
DO NOT return JSON format. Instead, use this pattern:

For the request "Find all posts", you should respond:
"I understand you want to find all posts. I will execute the following URPC operation: repo({entity: "post", source: "[correct source for PostEntity]"}).findMany()"

For the request "Create a user named jack", you should respond:
"I understand you want to create a new user named jack. I will execute the following URPC operation: repo({entity: "user", source: "[correct source for UserEntity]"}).create({data: {id: "generated-id", name: "jack", email: "jack@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jack"}})"

For the request "Find user with ID 1", you should respond:
"I understand you want to find a user with ID 1. I will execute the following URPC operation: repo({entity: "user", source: "[correct source for UserEntity]"}).findOne({where: {id: "1"}})"

## Key Rules:
1. **CRITICAL**: Always select the correct source parameter based on the "Entity Supported Sources" section above. Each entity has specific supported sources - you MUST use one of the supported sources for each entity.
2. **CRITICAL**: Always use the correct entity parameter: "user" for user operations, "post" for post/article operations
3. Map user natural language to correct entity names: user/users → "user", post/posts/article/articles → "post"
4. Look up the correct source for each entity from "Entity Supported Sources" section
5. Always include the actual URPC code in your response using the exact format: repo({entity: "[correct-entity]", source: "[correct-source]"}).methodName(...)
6. Use "generated-id" as placeholder for new record IDs in create operations
7. For create operations, always include all required fields based on the entity schema
8. Respond in natural language that explains what you're doing, followed by the URPC code
9. Never return JSON format - always use descriptive text with embedded URPC code

## Processing Flow
1. Understand user's natural language request
2. Map user's intent to correct entity name (user/post)
3. Look up the correct source for that entity from "Entity Supported Sources"
4. Analyze the operation type to execute
5. Build corresponding URPC operation with correct entity and source
6. Explain what you're doing and include the URPC code in your response

## Example Responses:
User: "Find all users"
Your response: "I understand you want to find all users. I will execute the following URPC operation: repo({entity: "user", source: "[correct source for UserEntity]"}).findMany()"

User: "Create a user named jack with email jack@test.com"
Your response: "I understand you want to create a new user named jack with email jack@test.com. I will execute the following URPC operation: repo({entity: "user", source: "[correct source for UserEntity]"}).create({data: {id: "generated-id", name: "jack", email: "jack@test.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jack"}})"

User: "Find all posts"
Your response: "I understand you want to find all posts. I will execute the following URPC operation: repo({entity: "post", source: "[correct source for PostEntity]"}).findMany()"

Remember: 
- Always include the actual URPC code in your natural language response, never return JSON format
- ALWAYS use the correct source parameter based on the Entity Supported Sources section
- Replace [correct source for EntityName] with the actual source value from the supported sources list
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
        if (this.debug) {
          console.log("[URPC Code]:", urpcCode);
        }

        // Pre-generate random ID for create operations and replace placeholders in urpcCode
        let actualUrpcCode = urpcCode;
        if (urpcCode.includes("create") && urpcCode.includes("generated-id")) {
          const randomId = this.generateRandomId();
          actualUrpcCode = urpcCode.replace(/generated-id/g, randomId);
          if (this.debug) {
            console.log("[Generated rpcCode]:", actualUrpcCode);
          }
        }

        const result = await this.executeURPCCode(actualUrpcCode);
        if (this.debug) {
          console.log("[Result]:", result);
        }

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
        const source = this.extractSource(urpcCode);
        const options = this.extractOptions(urpcCode);
        return await repo({ entity, source }).findMany(options);
      } else if (urpcCode.includes("findOne")) {
        const entity = this.extractEntity(urpcCode);
        const source = this.extractSource(urpcCode);
        const options = this.extractOptions(urpcCode);
        return await repo({ entity, source }).findOne(options);
      } else if (urpcCode.includes("create")) {
        const entity = this.extractEntity(urpcCode);
        const source = this.extractSource(urpcCode);
        const options = this.extractOptions(urpcCode);
        return await repo({ entity, source }).create(options);
      } else if (urpcCode.includes("update")) {
        const entity = this.extractEntity(urpcCode);
        const source = this.extractSource(urpcCode);
        const options = this.extractOptions(urpcCode);
        return await repo({ entity, source }).update(options);
      } else if (urpcCode.includes("delete")) {
        const entity = this.extractEntity(urpcCode);
        const source = this.extractSource(urpcCode);
        const options = this.extractOptions(urpcCode);
        return await repo({ entity, source }).delete(options);
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

  private extractSource(urpcCode: string): string {
    const match = urpcCode.match(/source:\s*"([^"]+)"/);
    return match ? match[1] : "memory";
  }

  private extractOptions(urpcCode: string): any {
    // Improved option extraction, supporting all URPC operations
    try {
      // Match parameter part of method call - use more accurate regex to match complete parameters
      const match = urpcCode.match(/\)\.(\w+)\((.+)\)$/);
      if (match) {
        const methodName = match[1];
        if (this.debug) {
          console.log("[MethodName]:", methodName);
        }
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
          if (this.debug) {
            console.log(
              "JSON parsing failed, trying improved parsing:",
              paramsStr
            );
          }
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

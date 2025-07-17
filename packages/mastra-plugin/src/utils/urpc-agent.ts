import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertSchemaToMarkdown } from "./entity-schema-to-markdown";
import { convertEntitySourcesToMarkdown } from "./entity-source-to-markdown";
import { MastraOptions, Output, URPC } from "./type";
import { EntityConfigs, SchemaObject } from "@unilab/urpc-core";

export class URPCAgent {
  private openrouterApiKey: string;
  private model: string;
  private instructions: string = "";
  private debug: boolean;
  private URPC: URPC;
  private isProxyConfigured: boolean = false;

  constructor(options: MastraOptions & { URPC: URPC }) {
    this.URPC = options.URPC;
    this.debug = options.debug || false;
    this.openrouterApiKey =
      options.openrouterApiKey || process.env.OPENROUTER_API_KEY || "";
    this.model = options.defaultModel || "google/gemini-2.0-flash-001";
    this.instructions = this.generateInstructions();
  }

  private generateInstructions(options?: {
    entitySchemasOfClient: Record<string, SchemaObject>;
    entitySourcesOfClient: Record<string, string[]>;
    entityConfigsOfClient: EntityConfigs;
  }): string {
    const entitySchemasOfServer = this.URPC.getEntitySchemas();
    const entitySourcesOfServer = this.URPC.getEntitySources();
    const entityConfigsOfServer = this.URPC.getEntityConfigs();

    const {
      entitySchemasOfClient,
      entitySourcesOfClient,
      entityConfigsOfClient,
    } = options || {};

    const entitySchemas = {
      ...entitySchemasOfServer,
      ...entitySchemasOfClient,
    };

    const entitySources = {
      ...entitySourcesOfServer,
      ...entitySourcesOfClient,
    };

    const entityConfigs = {
      ...entityConfigsOfServer,
      ...entityConfigsOfClient,
    };

    const entityMarkdown = convertSchemaToMarkdown(entitySchemas);
    const entitySourcesMarkdown = convertEntitySourcesToMarkdown(
      entitySources,
      entityConfigs
    );

    if (this.debug) {
      console.log("[Schemas]:\n", JSON.stringify(entitySchemas, null, 2));
      console.log(
        "[Entity Sources]:\n",
        JSON.stringify(entitySources, null, 2)
      );
      console.log(
        "[Entity Configs]:\n",
        JSON.stringify(entityConfigs, null, 2)
      );
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
3. **CRITICAL**: Source Selection Rules:
   - If user explicitly specifies a source in their request, use that source (if it's supported for the entity)
   - If user does NOT specify a source, automatically use the source marked with "(default)" for that entity
   - If no default is marked, use the first available source for that entity
4. Map user natural language to correct entity names: user/users → "user", post/posts/article/articles → "post"
5. Look up the correct source for each entity from "Entity Supported Sources" section
6. Always include the actual URPC code in your response using the exact format: repo({entity: "[correct-entity]", source: "[correct-source]"}).methodName(...)
7. Use "generated-id" as placeholder for new record IDs in create operations
8. For create operations, always include all required fields based on the entity schema
9. Respond in natural language that explains what you're doing, followed by the URPC code
10. Never return JSON format - always use descriptive text with embedded URPC code

## Processing Flow
1. Understand user's natural language request
2. Map user's intent to correct entity name (user/post)
3. Determine the source to use:
   - Check if user explicitly mentioned a source in their request
   - If yes, use that source (if supported for the entity)
   - If no, use the source marked with "(default)" for that entity
   - If no default marked, use the first available source
4. Analyze the operation type to execute
5. Build corresponding URPC operation with correct entity and source
6. Explain what you're doing and include the URPC code in your response

## Example Responses:
User: "Find all users"
Your response: "I understand you want to find all users. I will execute the following URPC operation: repo({entity: "user", source: "[default source for UserEntity]"}).findMany()"

User: "Find all users from mock source"
Your response: "I understand you want to find all users from mock source. I will execute the following URPC operation: repo({entity: "user", source: "mock"}).findMany()"

User: "Create a user named jack with email jack@test.com"
Your response: "I understand you want to create a new user named jack with email jack@test.com. I will execute the following URPC operation: repo({entity: "user", source: "[default source for UserEntity]"}).create({data: {id: "generated-id", name: "jack", email: "jack@test.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jack"}})"

User: "Find all posts"
Your response: "I understand you want to find all posts. I will execute the following URPC operation: repo({entity: "post", source: "[default source for PostEntity]"}).findMany()"

Remember: 
- Always include the actual URPC code in your natural language response, never return JSON format
- ALWAYS use the correct source parameter based on the Entity Supported Sources section
- When user doesn't specify source, automatically use the source marked with "(default)" for that entity
- When user specifies source explicitly, use that source if it's supported for the entity
- Replace [default source for EntityName] with the actual default source value from the supported sources list
`;
  }

  private newAgent() {
    return new Agent({
      name: "URPC Smart Data Assistant",
      description:
        "An intelligent data operation assistant based on URPC, capable of understanding natural language and executing corresponding data operations",
      instructions: this.instructions,
      model: createOpenRouter({
        apiKey: this.openrouterApiKey,
      }).chat(this.model),
    });
  }

  setProxyConfig({
    entitySchemas,
    entitySources,
    entityConfigs,
  }: {
    entitySchemas: Record<string, SchemaObject>;
    entitySources: Record<string, string[]>;
    entityConfigs: EntityConfigs;
  }) {
    if (this.isProxyConfigured) {
      return;
    }
    this.instructions = this.generateInstructions({
      entitySchemasOfClient: entitySchemas,
      entitySourcesOfClient: entitySources,
      entityConfigsOfClient: entityConfigs,
    });
    this.isProxyConfigured = true;
  }

  async processRequest({
    input,
    model,
    proxy,
  }: {
    input: string;
    model?: string;
    proxy?: boolean;
  }): Promise<Output> {
    try {
      if (model) {
        this.model = model;
      }

      const agent = this.newAgent();

      const response = await agent.generate([
        {
          role: "system",
          content: this.instructions,
        },
        {
          role: "user",
          content: input,
        },
      ]);

      if (proxy) {
        return this.parseAIResponse(response.text);
      } else {
        const output = this.parseAIResponse(response.text);
        const urpcCode = output.urpc_code;
        if (!urpcCode) {
          return output;
        }
        return this.executeURPCCode(urpcCode);
      }
    } catch (error: any) {
      return {
        success: false,
        operation: "unknown",
        entity: "unknown",
        source: "unknown",
        data: null,
        message: `Error occurred while processing request: ${error.message}`,
        urpc_code: null,
      };
    }
  }

  private parseAIResponse(agentResponse: string): Output {
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
        let urpc_code = urpcCode;
        if (urpcCode.includes("create") && urpcCode.includes("generated-id")) {
          const randomId = this.generateRandomId();
          urpc_code = urpcCode.replace(/generated-id/g, randomId);
          if (this.debug) {
            console.log("[Generated rpcCode]:", urpc_code);
          }
        }

        return {
          operation: "",
          entity: "",
          source: "",
          urpc_code,
          data: null,
          message: "",
          success: true,
        };
      }

      // If no URPC code found, return agent's direct reply
      return {
        success: true,
        operation: "conversation",
        entity: "none",
        source: "none",
        data: null,
        message: agentResponse,
        urpc_code: null,
      };
    } catch (error: any) {
      return {
        success: false,
        operation: "",
        entity: "",
        source: "",
        urpc_code: null,
        data: null,
        message: `Error occurred while parsing AI response.`,
      };
    }
  }

  private async executeURPCCode(urpcCode: string): Promise<Output> {
    const operation = this.extractOperation(urpcCode);
    const entity = this.extractEntity(urpcCode);
    const source = this.extractSource(urpcCode);
    const options = this.extractOptions(urpcCode);
    try {
      if (urpcCode.includes("findMany")) {
        const data = await this.URPC.repo({ entity, source }).findMany(options);
        return {
          operation,
          entity,
          source,
          data,
          urpc_code: urpcCode,
          message: "",
          success: true,
        };
      } else if (urpcCode.includes("findOne")) {
        const data = await this.URPC.repo({ entity, source }).findOne(options);
        return {
          operation,
          entity,
          source,
          data,
          urpc_code: urpcCode,
          message: "",
          success: true,
        };
      } else if (urpcCode.includes("create")) {
        const data = await this.URPC.repo({ entity, source }).create(options);
        return {
          operation,
          entity,
          source,
          data,
          urpc_code: urpcCode,
          message: "",
          success: true,
        };
      } else if (urpcCode.includes("update")) {
        const data = await this.URPC.repo({ entity, source }).update(options);
        return {
          operation,
          entity,
          source,
          data,
          urpc_code: urpcCode,
          message: "",
          success: true,
        };
      } else if (urpcCode.includes("delete")) {
        const data = await this.URPC.repo({ entity, source }).delete(options);
        return {
          operation,
          entity,
          source,
          data,
          urpc_code: urpcCode,
          message: "",
          success: true,
        };
      } else if (urpcCode.includes("call")) {
        const data = await this.URPC.repo({ entity, source }).call(options);
        return {
          operation,
          entity,
          source,
          data,
          urpc_code: urpcCode,
          message: "",
          success: true,
        };
      }
      return {
        operation,
        entity,
        source,
        data: null,
        urpc_code: urpcCode,
        message: `Unsupported operations: ${operation}`,
        success: false,
      };
    } catch (error: any) {
      return {
        operation,
        entity,
        source,
        data: null,
        urpc_code: urpcCode,
        message: `Error occurred while executing operation.`,
        success: false,
      };
    }
  }

  private extractOperation(urpcCode: string): string {
    if (urpcCode.includes("findMany")) return "findMany";
    if (urpcCode.includes("findOne")) return "findOne";
    if (urpcCode.includes("create")) return "create";
    if (urpcCode.includes("update")) return "update";
    if (urpcCode.includes("delete")) return "delete";
    if (urpcCode.includes("call")) return "call";
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

  async streamResponse({
    input,
    model,
    proxy,
  }: {
    input: string;
    model?: string;
    proxy?: boolean;
  }): Promise<ReadableStream> {
    if (model) {
      this.model = model;
    }

    const agent = this.newAgent();

    const stream = await agent.stream([
      {
        role: "system",
        content: this.instructions,
      },
      {
        role: "user",
        content: input,
      },
    ]);

    return stream.textStream;
  }
}

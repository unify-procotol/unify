import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertSchemaToMarkdown } from "./entity-schema-to-markdown";
import { convertEntitySourcesToMarkdown } from "./entity-source-to-markdown";
import { MastraOptions, Output, URPC, ExecutionPlan, PlanOutput } from "./type";
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

    return `You are an intelligent data manipulation assistant who has mastered the use of the URPC SDK.

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
- Conditional query with operators: repo({entity: "user", source: "[select from supported sources]"}).findMany({where: {age: {$gt: 18}}})
- Complex query with operators: repo({entity: "user", source: "[select from supported sources]"}).findMany({where: {email: {endsWith: "@gmail.com"}, status: {$in: ["active", "pending"]}}})
- Paginated query: repo({entity: "user", source: "[select from supported sources]"}).findMany({limit: 10, offset: 0})
- Sorted query: repo({entity: "user", source: "[select from supported sources]"}).findMany({order_by: {id: "desc"}})

### 2. Create Operations (CREATE)
- Create single user: repo({entity: "user", source: "[select from supported sources]"}).create({data: {id: "uuid", name: "jack", email: "jack@example.com", avatar: "avatar-url"}})
- Create multiple users: repo({entity: "user", source: "[select from supported sources]"}).createMany({data: [{id: "uuid1", name: "jack", email: "jack@example.com"}, {id: "uuid2", name: "jane", email: "jane@example.com"}]})
- Create single article: repo({entity: "post", source: "[select from supported sources]"}).create({data: {id: "uuid", title: "Title", content: "Content", userId: "user-id"}})
- Create multiple articles: repo({entity: "post", source: "[select from supported sources]"}).createMany({data: [{id: "uuid1", title: "Title 1", content: "Content 1"}, {id: "uuid2", title: "Title 2", content: "Content 2"}]})

### 3. Update Operations (UPDATE)
- Update single user: repo({entity: "user", source: "[select from supported sources]"}).update({where: {id: "user-id"}, data: {name: "New Name"}})
- Update multiple users with operators: repo({entity: "user", source: "[select from supported sources]"}).updateMany({where: {age: {$lt: 30}, status: "pending"}, data: {status: "active"}})
- Update with complex conditions: repo({entity: "user", source: "[select from supported sources]"}).updateMany({where: {email: {contains: "@temp.com"}}, data: {status: "inactive"}})
- Update ALL users (use not null condition): repo({entity: "user", source: "[select from supported sources]"}).updateMany({where: {id: {not: null}}, data: {status: "active"}})
- Upsert operation: repo({entity: "user", source: "[select from supported sources]"}).upsert({where: {email: "user@example.com"}, update: {name: "Updated Name"}, create: {id: "uuid", name: "New User", email: "user@example.com"}})
- Upsert multiple records: repo({entity: "user", source: "[select from supported sources]"}).upsertMany({data: [{id: "uuid1", name: "jack", email: "jack@example.com"}, {id: "uuid2", name: "jane", email: "jane@example.com"}], onConflictDoUpdate: {target: "id"}})

**IMPORTANT**: For updateMany operations, the \'where\' clause is REQUIRED. You cannot perform updateMany without specifying which records to update.

**CRITICAL**: When user wants to update ALL records, do NOT use empty where clause \`{}\` as it won't match any data. Instead, use a condition that matches all records, such as:
- {where: {id: {not: null}}} - matches all records with non-null id
- {where: {name: {not: null}}} - matches all records with non-null name
- {where: {email: {not: null}}} - matches all records with non-null email

### 4. Delete Operations (DELETE)
- Delete user: repo({entity: "user", source: "[select from supported sources]"}).delete({where: {id: "user-id"}})
- Delete article: repo({entity: "post", source: "[select from supported sources]"}).delete({where: {id: "post-id"}})

### 5. Query Operators Support
For findMany and updateMany, you can use advanced query operators in the where clause. **IMPORTANT: updateMany operations REQUIRE a where clause to specify which records to update.** The URPC SDK supports the following QueryOperators:

#### Comparison Operators:
- **$gt**: Greater than - {age: {$gt: 18}} (age > 18)
- **$gte**: Greater than or equal - {age: {$gte: 18}} (age >= 18)
- **$lt**: Less than - {age: {$lt: 65}} (age < 65)
- **$lte**: Less than or equal - {age: {$lte: 65}} (age <= 65)
- **$eq**: Equal to - {status: {$eq: "active"}} (status = "active")
- **$ne**: Not equal to - {status: {$ne: "inactive"}} (status != "inactive")

#### Array Operators:
- **$in**: Value is in array - {status: {$in: ["active", "pending"]}} (status in ["active", "pending"])
- **$nin**: Value is not in array - {status: {$nin: ["inactive", "banned"]}} (status not in ["inactive", "banned"])

#### String Operators:
- **contains**: String contains substring - {email: {contains: "@gmail.com"}} (email contains "@gmail.com")
- **startsWith**: String starts with prefix - {name: {startsWith: "John"}} (name starts with "John")
- **endsWith**: String ends with suffix - {email: {endsWith: ".edu"}} (email ends with ".edu")

#### Special Operators:
- **not**: Not equal to (null check) - {deletedAt: {not: null}} (deletedAt is not null)
- **mode**: Case sensitivity mode - {name: {contains: "john", mode: "insensitive"}} (case-insensitive search)

#### Complex Query Examples:
- Find users with age between 18-65: {age: {$gte: 18, $lte: 65}}
- Find active or pending users: {status: {$in: ["active", "pending"]}}
- Find users with Gmail emails: {email: {endsWith: "@gmail.com"}}
- Find users not banned: {status: {$ne: "banned"}}
- Find posts with specific titles (case-insensitive): {title: {contains: "react", mode: "insensitive"}}
- Combine multiple conditions: {age: {$gt: 18}, email: {contains: "@company.com"}, status: {$in: ["active", "verified"]}}

## IMPORTANT: Response Format
You MUST analyze the user's request and determine if it requires multiple URPC operations or just one.

### For Single Operation Requests:
Respond with natural language that includes the actual URPC code to be executed. 
DO NOT return JSON format. Instead, use this pattern:

For the request "Find all posts", you should respond:
"I understand you want to find all posts. I will execute the following URPC operation: repo({entity: "post", source: "[correct source for PostEntity]"}).findMany()"

For the request "Create a user named jack", you should respond:
"I understand you want to create a new user named jack. I will execute the following URPC operation: repo({entity: "user", source: "[correct source for UserEntity]"}).create({data: {id: "generated-id", name: "jack", email: "jack@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jack"}})"

### For Multi-Step Operation Requests:
When the user's request requires multiple operations (like "Create a user named John and then create a post for him"), you MUST respond with an execution plan in the following JSON format:

{
  "execution_plan": {
    "steps": [
      {
        "description": "Create a user named John",
        "urpc_code": "repo({entity: \\"user\\", source: \\"[correct source for UserEntity]\\"}).create({data: {id: \\"generated-id\\", name: \\"John\\", email: \\"john@example.com\\", avatar: \\"https://api.dicebear.com/7.x/avataaars/svg?seed=john\\"}})",
        "order": 1
      },
      {
        "description": "Create a post for John",
        "urpc_code": "repo({entity: \\"post\\", source: \\"[correct source for PostEntity]\\"}).create({data: {id: \\"generated-id\\", title: \\"John's First Post\\", content: \\"Hello, this is my first post!\\", userId: \\"user-id\\"}})",
        "order": 2
      }
    ],
    "total_steps": 2
  }
}

### How to Identify Multi-Step Requests:
Look for these patterns in user requests:
- Multiple actions connected by "and", "then", "also", "plus"
- Sequential operations like "first do X, then do Y"
- Complex conditions that require separate operations
- Different entities or different conditions on the same entity

Examples of multi-step requests:
- "Create a user named John and then create a post for him"
- "Find all active users and update their status to verified"
- "Delete all inactive posts and create a new welcome post"
- "Update all users to active status and then create a summary post"

Examples of single-step requests:
- "Find all users"
- "Create a user named John"
- "Update all posts to published"
- "Delete inactive users"

For the request "Create multiple users: Alice and Bob", you should respond:
"I understand you want to create multiple users. I will execute the following URPC operation: repo({entity: "user", source: "[correct source for UserEntity]"}).createMany({data: [{id: "generated-id-1", name: "Alice", email: "alice@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice"}, {id: "generated-id-2", name: "Bob", email: "bob@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob"}]})"

For the request "Update all users older than 30 to active status", you should respond:
"I understand you want to update all users older than 30 to active status. I will execute the following URPC operation: repo({entity: "user", source: "[correct source for UserEntity]"}).updateMany({where: {age: {$gt: 30}}, data: {status: "active"}})"

For the request "Find users whose email contains gmail", you should respond:
"I understand you want to find users whose email contains gmail. I will execute the following URPC operation: repo({entity: "user", source: "[correct source for UserEntity]"}).findMany({where: {email: {contains: "gmail"}}})"

For the request "Find user with ID 1", you should respond:
"I understand you want to find a user with ID 1. I will execute the following URPC operation: repo({entity: "user", source: "[correct source for UserEntity]"}).findOne({where: {id: "1"}})"

For the request "Create or update user with email test@example.com", you should respond:
"I understand you want to create or update a user with email test@example.com. I will execute the following URPC operation: repo({entity: "user", source: "[correct source for UserEntity]"}).upsert({where: {email: "test@example.com"}, update: {name: "Updated Name"}, create: {id: "generated-id", name: "New User", email: "test@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=test"}})"

## Key Rules:
1. **CRITICAL**: Always select the correct source parameter based on the "Entity Supported Sources" section above. Each entity has specific supported sources - you MUST use one of the supported sources for each entity.
2. **CRITICAL**: Always use the correct entity parameter: "user" for user operations, "post" for post/article operations
3. **CRITICAL**: Source Selection Rules:
   - If user explicitly specifies a source in their request, use that source (if it's supported for the entity)
   - If user does NOT specify a source, automatically use the source marked with "(default)" for that entity
   - If no default is marked, use the first available source for that entity
4. **CRITICAL**: For updateMany operations, the where clause is REQUIRED. You MUST always include a where clause to specify which records to update. Never generate updateMany without a where clause.
   - When user wants to update ALL records, use \`{where: {id: {not: null}}}\` or \`{where: {name: {not: null}}}\` instead of empty \`{}\`
   - When user wants to update specific records, use appropriate conditions like \`{where: {status: "pending"}}\`
5. Map user natural language to correct entity names: user/users → "user", post/posts/article/articles → "post"
6. Look up the correct source for each entity from "Entity Supported Sources" section
7. Always include the actual URPC code in your response using the exact format: repo({entity: "[correct-entity]", source: "[correct-source]"}).methodName(...)
8. Use "generated-id" as placeholder for new record IDs in create operations
9. For create operations, always include all required fields based on the entity schema
10. Respond in natural language that explains what you're doing, followed by the URPC code
11. Never return JSON format - always use descriptive text with embedded URPC code

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

User: "Create users for Alice, Bob, and Charlie"
Your response: "I understand you want to create multiple users for Alice, Bob, and Charlie. I will execute the following URPC operation: repo({entity: "user", source: "[default source for UserEntity]"}).createMany({data: [{id: "generated-id-1", name: "Alice", email: "alice@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice"}, {id: "generated-id-2", name: "Bob", email: "bob@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob"}, {id: "generated-id-3", name: "Charlie", email: "charlie@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie"}]})"

User: "Update all pending users to active"
Your response: "I understand you want to update all pending users to active status. I will execute the following URPC operation: repo({entity: "user", source: "[default source for UserEntity]"}).updateMany({where: {status: "pending"}, data: {status: "active"}})"

User: "Update all users to active status"
Your response: "I understand you want to update all users to active status. I will execute the following URPC operation: repo({entity: "user", source: "[default source for UserEntity]"}).updateMany({where: {id: {not: null}}, data: {status: "active"}})"

User: "Set all posts as published"
Your response: "I understand you want to set all posts as published. I will execute the following URPC operation: repo({entity: "post", source: "[default source for PostEntity]"}).updateMany({where: {id: {not: null}}, data: {status: "published"}})"

User: "Find users with age greater than 25"
Your response: "I understand you want to find users with age greater than 25. I will execute the following URPC operation: repo({entity: "user", source: "[default source for UserEntity]"}).findMany({where: {age: {$gt: 25}}})"

User: "Find all posts"
Your response: "I understand you want to find all posts. I will execute the following URPC operation: repo({entity: "post", source: "[default source for PostEntity]"}).findMany()"

User: "Create or update user john@example.com"
Your response: "I understand you want to create or update user john@example.com. I will execute the following URPC operation: repo({entity: "user", source: "[default source for UserEntity]"}).upsert({where: {email: "john@example.com"}, update: {name: "John Updated"}, create: {id: "generated-id", name: "John", email: "john@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john"}})"

User: "Create or update multiple users: Alice and Bob by id"
Your response: "I understand you want to create or update multiple users. I will execute the following URPC operation: repo({entity: "user", source: "[default source for UserEntity]"}).upsertMany({data: [{id: "generated-id-1", name: "Alice", email: "alice@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice"}, {id: "generated-id-2", name: "Bob", email: "bob@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob"}], onConflictDoUpdate: {target: "id"}})"

Remember: 
- Always include the actual URPC code in your natural language response, never return JSON format
- ALWAYS use the correct source parameter based on the Entity Supported Sources section
- When user doesn't specify source, automatically use the source marked with "(default)" for that entity
- When user specifies source explicitly, use that source if it's supported for the entity
- Replace [default source for EntityName] with the actual default source value from the supported sources list
- For updateMany operations targeting ALL records, use \`{where: {id: {not: null}}}\` instead of empty \`{where: {}}\`
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
  }): Promise<PlanOutput | Output> {
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

        if ("execution_plan" in output && output.execution_plan) {
          return await this.executeExecutionPlan(output.execution_plan);
        }

        if ("urpc_code" in output) {
          const urpcCode = output.urpc_code;
          if (!urpcCode) {
            return output;
          }
          const result = await this.executeURPCCode(urpcCode);
          return {
            ...result,
            results: [result],
          };
        }

        return output;
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

  private parseAIResponse(agentResponse: string): PlanOutput | Output {
    try {
      // First try to parse as JSON (execution plan)
      if (
        agentResponse.trim().startsWith("{") ||
        agentResponse.includes('"execution_plan"')
      ) {
        try {
          const jsonMatch = agentResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.execution_plan) {
              // Process the execution plan to replace generated-id placeholders
              const processedPlan = this.processExecutionPlan(
                parsed.execution_plan
              );
              return {
                execution_plan: processedPlan,
              };
            }
          }
        } catch (jsonError) {
          if (this.debug) {
            console.log(
              "JSON parsing failed, trying URPC code extraction:",
              jsonError
            );
          }
        }
      }

      // Try to extract single URPC operation from agent response
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

  private processExecutionPlan(executionPlan: ExecutionPlan): ExecutionPlan {
    // Process each step to replace generated-id placeholders
    let userId = "";
    const processedSteps = executionPlan.steps.map((step) => {
      let processedCode = step.urpc_code;
      if (step.urpc_code.includes("create")) {
        if (step.urpc_code.includes("generated-id")) {
          const randomId = this.generateRandomId();
          processedCode = step.urpc_code.replace(/generated-id/g, randomId);
          if (this.extractEntity(step.urpc_code).includes("user")) {
            userId = randomId;
          }
        }
        if (step.urpc_code.includes("user-id")) {
          processedCode = step.urpc_code.replace(/user-id/g, userId);
        }
      }

      return {
        ...step,
        urpc_code: processedCode,
      };
    });

    return {
      ...executionPlan,
      steps: processedSteps,
    };
  }

  private async executeExecutionPlan(
    executionPlan: ExecutionPlan
  ): Promise<PlanOutput> {
    const results: Output[] = [];
    let allSuccess = true;
    let combinedMessage = "";

    // Sort steps by order
    const sortedSteps = [...executionPlan.steps].sort(
      (a, b) => a.order - b.order
    );

    for (const step of sortedSteps) {
      try {
        if (this.debug) {
          console.log(`[执行步骤 ${step.order}]: ${step.description}`);
          console.log(`[URPC代码]: ${step.urpc_code}`);
        }

        const result = await this.executeURPCCode(step.urpc_code);
        results.push({
          ...result,
          message: `Step ${step.order}: ${step.description} - ${
            result.message || (result.success ? "success" : "failure")
          }`,
        });

        if (!result.success) {
          allSuccess = false;
          combinedMessage += `Step ${step.order} failure: ${result.message}; `;
        } else {
          combinedMessage += `Step ${step.order} success: ${step.description}; `;
        }
      } catch (error: any) {
        allSuccess = false;
        const errorResult: Output = {
          success: false,
          operation: "unknown",
          entity: "unknown",
          source: "unknown",
          data: null,
          message: `Step ${step.order} execution error: ${error.message}`,
          urpc_code: step.urpc_code,
        };
        results.push(errorResult);
        combinedMessage += `Step ${step.order} error: ${error.message};\n `;
      }
    }

    return {
      execution_plan: executionPlan,
      results: results,
    };
  }

  private async executeURPCCode(urpcCode: string): Promise<Output> {
    const operation = this.extractOperation(urpcCode);
    const entity = this.extractEntity(urpcCode);
    const source = this.extractSource(urpcCode);
    const options = this.extractOptions(urpcCode);
    try {
      let data;
      switch (operation) {
        case "findMany": {
          data = await this.URPC.repo({ entity, source }).findMany(options);
          break;
        }
        case "findOne": {
          data = await this.URPC.repo({ entity, source }).findOne(options);
          break;
        }
        case "createMany": {
          data = await this.URPC.repo({ entity, source }).createMany(options);
          break;
        }
        case "create": {
          data = await this.URPC.repo({ entity, source }).create(options);
          break;
        }
        case "updateMany": {
          data = await this.URPC.repo({ entity, source }).updateMany(options);
          break;
        }
        case "update": {
          data = await this.URPC.repo({ entity, source }).update(options);
          break;
        }
        case "upsert": {
          data = await this.URPC.repo({ entity, source }).upsert(options);
          break;
        }
        case "upsertMany": {
          data = await this.URPC.repo({ entity, source }).upsertMany(options);
          break;
        }
        case "delete": {
          data = await this.URPC.repo({ entity, source }).delete(options);
          break;
        }
        default:
          return {
            operation,
            entity,
            source,
            data: null,
            urpc_code: urpcCode,
            message: `Unsupported operations: ${operation}`,
            success: false,
          };
      }
      return {
        operation,
        entity,
        source,
        data,
        urpc_code: urpcCode,
        message: "",
        success: true,
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
    if (urpcCode.includes("createMany")) return "createMany";
    if (urpcCode.includes("create")) return "create";
    if (urpcCode.includes("updateMany")) return "updateMany";
    if (urpcCode.includes("update")) return "update";
    if (urpcCode.includes("upsertMany")) return "upsertMany";
    if (urpcCode.includes("upsert")) return "upsert";
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

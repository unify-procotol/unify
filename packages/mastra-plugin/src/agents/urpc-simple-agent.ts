import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AgentInterface } from "../type";
import { convertSchemaToMarkdown } from "../utils/entity-schema-to-markdown";
import { convertEntitySourcesToMarkdown } from "../utils/entity-source-to-markdown";
import {
  EntityConfigs,
  SchemaObject,
  simplifyEntityName,
} from "@unilab/urpc-core";
import { URPC } from "../type";

export interface StepOutput {
  operation: string;
  entity: string;
  source: string;
  data: any;
  message: string;
  success: boolean;
  urpc_code: string | null;
}

export interface ExecutionPlan {
  steps: Array<{
    description: string;
    urpc_code: string;
    order: number;
  }>;
  total_steps: number;
}

export interface PlanOutput {
  execution_plan: ExecutionPlan;
  results: StepOutput[];
  message?: string;
}

export class URPCSimpleAgent implements AgentInterface {
  private URPC: URPC;
  private debug: boolean = false;
  private instructions: string = "";
  private openrouterApiKey: string;
  private model: string;

  constructor(options: {
    URPC: URPC;
    debug?: boolean;
    openrouterApiKey?: string;
    defaultModel?: string;
  }) {
    this.URPC = options.URPC;
    this.debug = options.debug || false;
    this.openrouterApiKey =
      options.openrouterApiKey || process.env.OPENROUTER_API_KEY || "";
    this.model = options.defaultModel || "google/gemini-2.0-flash-001";
  }

  private getEntityInfo(entities?: string[]) {
    const _entitySchemas = this.URPC.getEntitySchemas();
    const _entitySources = this.URPC.getEntitySources();
    const _entityConfigs = this.URPC.getEntityConfigs();

    if (entities) {
      const simplifiedEntityNames = entities.map((entity) =>
        simplifyEntityName(entity)
      );

      const entitySchemas = Object.fromEntries(
        Object.entries(_entitySchemas).filter(([key]) =>
          simplifiedEntityNames.includes(simplifyEntityName(key))
        )
      );
      const entitySources = Object.fromEntries(
        Object.entries(_entitySources).filter(([key]) =>
          simplifiedEntityNames.includes(simplifyEntityName(key))
        )
      );
      const entityConfigs = Object.fromEntries(
        Object.entries(_entityConfigs).filter(([key]) => {
          return simplifiedEntityNames.includes(simplifyEntityName(key));
        })
      );
      return {
        entitySchemas,
        entitySources,
        entityConfigs,
      };
    }

    return {
      entitySchemas: _entitySchemas,
      entitySources: _entitySources,
      entityConfigs: _entityConfigs,
    };
  }

  private generateInstructions({
    entitySchemas,
    entitySources,
    entityConfigs,
  }: {
    entitySchemas: Record<string, SchemaObject>;
    entitySources: Record<string, string[]>;
    entityConfigs: EntityConfigs;
  }): string {
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

    return `You are an intelligent URPC SDK data manipulation assistant.

## Entity Structure
${entityMarkdown}

## Entity Supported Sources
${entitySourcesMarkdown}

## Core Operations
**Entity Mapping**: user/users → "user", post/posts/article/articles → "post"

**CRUD Operations:**
- **findOne**: repo({entity: "user", source: "[select from supported sources]"}).findOne({where: {name: "jack"} })
- **findMany**: repo({entity: "user", source: "[select from supported sources]"}).findMany({where: {age: {$gt: 18}}, limit: 10})
- **create**: repo({entity: "user", source: "[select from supported sources]"}).create({data: {id: "uuid", name: "jack", email: "jack@example.com"}})
- **createMany**: repo({entity: "user", source: "[select from supported sources]"}).createMany({data: [{id: "uuid1", name: "jack", email: "jack@example.com"}, {id: "uuid2", name: "jane", email: "jane@example.com"}]})
- **update**: repo({entity: "user", source: "[select from supported sources]"}).update({where: {id: "user-id"}, data: {name: "New Name"}})
- **updateMany**: repo({entity: "user", source: "[select from supported sources]"}).updateMany({where: {status: "pending"}, data: {status: "active"}})
- **delete**: repo({entity: "user", source: "[select from supported sources]"}).delete({where: {id: "user-id"}})
- **upsert**: repo({entity: "user", source: "[select from supported sources]"}).upsert({where: {email: "test@test.com"}, update: {name: "Updated"}, create: {id: "uuid", name: "New", email: "test@test.com"}})
- **upsertMany**: repo({entity: "user", source: "[select from supported sources]"}).upsertMany({data: [{id: "uuid1", name: "jack", email: "jack@example.com"}, {id: "uuid2", name: "jane", email: "jane@example.com"}], onConflictDoUpdate: {target: "id"}})

**Query Operators**: $gt, $gte, $lt, $lte, $eq, $ne, $in, $nin, contains, startsWith, endsWith, not, mode

## Critical Rules
1. **Source Selection**: Use source marked "(default)" if user doesn't specify; use user-specified source if supported
2. **UpdateMany Requirement**: MUST include where clause. For "all records" use {where: {id: {not: null}}}
3. **Response Format**: ALWAYS return JSON execution plan format (even for single operations)

## Unified JSON Response Format

**ALL responses must use this JSON structure:**

{
  "execution_plan": {
    "steps": [
      {
        "description": "Brief description of the operation",
        "urpc_code": "repo({entity: \"entity\", source: \"source\"}).operation(...)",
        "order": 1
      }
    ],
    "total_steps": 1
  }
}

## Examples

**Single Operation:**
User: "Find all users"
Response:
{
  "execution_plan": {
    "steps": [
      {
        "description": "Find all users",
        "urpc_code": "repo({entity: \"user\", source: \"[default-source]\"}).findMany()",
        "order": 1
      }
    ],
    "total_steps": 1
  }
}

**Multi-Step Operation:**
User: "Create user John and create a post for him"
Response:
{
  "execution_plan": {
    "steps": [
      {
        "description": "Create user John",
        "urpc_code": "repo({entity: \"user\", source: \"[default-source]\"}).create({data: {id: \"generated-id\", name: \"John\", email: \"john@example.com\"}})",
        "order": 1
      },
      {
        "description": "Create post for John",
        "urpc_code": "repo({entity: \"post\", source: \"[default-source]\"}).create({data: {id: \"generated-id\", title: \"John's Post\", content: \"Hello!\", userId: \"user-id\"}})",
        "order": 2
      }
    ],
    "total_steps": 2
  }
}

## Key Guidelines
- Use "generated-id" placeholder for create operations
- Include required fields based on entity schema  
- Replace [default-source] with actual default source from supported sources
- Map user language to correct entities and operations
- For updateMany targeting all records: {where: {id: {not: null}}}
- ALWAYS return valid JSON format, never natural language responses`;
  }

  private createAgent(): Agent {
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
    this.instructions = this.generateInstructions({
      entitySchemas: entitySchemas,
      entitySources: entitySources,
      entityConfigs: entityConfigs,
    });
  }

  async processRequest({
    input,
    model,
    proxy,
    entities,
  }: {
    input: string;
    model?: string;
    proxy?: boolean;
    entities?: string[];
  }): Promise<PlanOutput> {
    try {
      if (model) {
        this.model = model;
      }

      if (entities && !proxy) {
        this.instructions = this.generateInstructions(
          this.getEntityInfo(entities)
        );
      }

      if (!this.instructions) {
        this.instructions = this.generateInstructions(this.getEntityInfo());
      }

      const agent = this.createAgent();

      const response = await agent.generate([
        {
          role: "user",
          content: input,
        },
      ]);

      if (proxy) {
        return this.parseAIResponse(response.text);
      } else {
        const output = this.parseAIResponse(response.text);

        return await this.executeExecutionPlan(output.execution_plan);
      }
    } catch (error: any) {
      return {
        execution_plan: {
          steps: [],
          total_steps: 0,
        },
        results: [],
        message: `Error occurred while processing request: ${error.message}`,
      };
    }
  }

  private parseAIResponse(agentResponse: string): PlanOutput {
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
            results: [],
          };
        }
      }

      return {
        execution_plan: {
          steps: [],
          total_steps: 0,
        },
        results: [],
        message: `Error occurred while parsing AI response.`,
      };
    } catch (error: any) {
      return {
        execution_plan: {
          steps: [],
          total_steps: 0,
        },
        results: [],
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
          if (this.extractEntity(step.urpc_code).includes("user") && !userId) {
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
    const results: StepOutput[] = [];

    // Sort steps by order
    const sortedSteps = [...executionPlan.steps].sort(
      (a, b) => a.order - b.order
    );

    for (const step of sortedSteps) {
      try {
        if (this.debug) {
          console.log(`[Execution step ${step.order}]: ${step.description}`);
          console.log(`[URPC_CODE]: ${step.urpc_code}`);
        }
        const result = await this.executeURPCCode(step.urpc_code);
        results.push(result);
      } catch (error: any) {
        const errorResult: StepOutput = {
          success: false,
          operation: "unknown",
          entity: "unknown",
          source: "unknown",
          data: null,
          message: `Step ${step.order} execution error: ${error.message}`,
          urpc_code: step.urpc_code,
        };
        results.push(errorResult);
      }
    }

    return {
      execution_plan: executionPlan,
      results: results,
    };
  }

  private async executeURPCCode(urpcCode: string): Promise<StepOutput> {
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
}

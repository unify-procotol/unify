import { Agent } from "@mastra/core/agent";
import { convertSchemaToMarkdown } from "../utils/entity-schema-to-markdown";
import { convertEntitySourcesToMarkdown } from "../utils/entity-source-to-markdown";
import {
  EntityConfigs,
  SchemaObject,
  simplifyEntityName,
} from "@unilab/urpc-core";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Mastra } from "@mastra/core";
import {
  URPC,
  ExecutionPlan,
  PlanOutput,
  StepOutput,
  URPCAgentRuntimeContext,
} from "../type";
import { RuntimeContext } from "@mastra/core/runtime-context";

let globalURPC: URPC;
let globalDebug: boolean;

const getURPCSimpleAgent = ({
  openrouterApiKey,
}: {
  openrouterApiKey: string;
}): Agent => {
  return new Agent({
    name: "URPC Smart Data Assistant",
    description:
      "An intelligent data operation assistant based on URPC, capable of understanding natural language and executing corresponding data operations",

    instructions: async ({ runtimeContext }) => {
      const entitySchemas: Record<string, SchemaObject> =
        runtimeContext.get("entity-schemas");
      const entitySources: Record<string, string[]> =
        runtimeContext.get("entity-sources");
      const entityConfigs: EntityConfigs = runtimeContext.get("entity-configs");

      const entityMarkdown = convertSchemaToMarkdown(entitySchemas);
      const entitySourcesMarkdown = convertEntitySourcesToMarkdown(
        entitySources,
        entityConfigs
      );

      if (globalDebug) {
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
      - **Find one data**: repo({entity: "user", source: "[select from supported sources]"}).findOne({where: {name: "jack"} })
      - **Query multiple data**: repo({entity: "user", source: "[select from supported sources]"}).findMany({where: {age: {gt: 18}}, limit: 10})
      - **Create one data**: repo({entity: "user", source: "[select from supported sources]"}).create({data: {id: "uuid", name: "jack", email: "jack@example.com"}})
      - **Create multiple data**: repo({entity: "user", source: "[select from supported sources]"}).createMany({data: [{id: "uuid1", name: "jack", email: "jack@example.com"}, {id: "uuid2", name: "jane", email: "jane@example.com"}]})
      - **Update one data**: repo({entity: "user", source: "[select from supported sources]"}).update({where: {id: "user-id"}, data: {name: "New Name"}})
      - **Update multiple data**: repo({entity: "user", source: "[select from supported sources]"}).updateMany({where: {status: "pending"}, data: {status: "active"}})
      - **Delete one data**: repo({entity: "user", source: "[select from supported sources]"}).delete({where: {id: "user-id"}})
      - **Upsert one data**: repo({entity: "user", source: "[select from supported sources]"}).upsert({where: {email: "test@test.com"}, update: {name: "Updated"}, create: {id: "uuid", name: "New", email: "test@test.com"}})
      - **Upsert multiple data**: repo({entity: "user", source: "[select from supported sources]"}).upsertMany({data: [{id: "uuid1", name: "jack", email: "jack@example.com"}, {id: "uuid2", name: "jane", email: "jane@example.com"}], onConflictDoUpdate: {target: "id"}})
      
      **Query Operators**: gt, gte, lt, lte, eq, ne, in, nin, contains, startsWith, endsWith, not, mode
      
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
    },

    model: ({ runtimeContext }) => {
      const model: string =
        runtimeContext.get("model") || "google/gemini-2.0-flash-001";
      return createOpenRouter({
        apiKey: openrouterApiKey,
      }).chat(model);
    },
  });
};

const getSummaryAgent = ({
  openrouterApiKey,
}: {
  openrouterApiKey: string;
}) => {
  return new Agent({
    name: "API Results Summary Assistant",
    description:
      "Professional AI assistant responsible for summarizing API execution results",
    instructions: `You are a professional AI assistant responsible for summarizing API execution results.

When users provide questions and API execution results, please generate summaries according to the following requirements:
1. Directly answer the user's question
2. Highlight key information and results
3. Express in concise language
4. If execution fails, explain the reason for failure

Please return the summary content directly without additional formatting.`,
    model: createOpenRouter({
      apiKey: openrouterApiKey,
    }).chat("openai/gpt-4o-mini"),
  });
};

export const getMastraInstance = ({
  URPC,
  openrouterApiKey,
  debug,
}: {
  URPC: URPC;
  openrouterApiKey: string;
  debug?: boolean;
}): Mastra => {
  globalURPC = URPC;
  globalDebug = debug ?? false;
  return new Mastra({
    agents: {
      urpcSimpleAgent: getURPCSimpleAgent({
        openrouterApiKey,
      }),
      summaryAgent: getSummaryAgent({
        openrouterApiKey,
      }),
    },
  });
};

export function getEntityInfo(entities?: string[]) {
  const _entitySchemas = globalURPC.getEntitySchemas();
  const _entitySources = globalURPC.getEntitySources();
  const _entityConfigs = globalURPC.getEntityConfigs();

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

export async function processRequest({
  agent,
  runtimeContext,
  mastraInstance,
  input,
  proxy,
  summary,
}: {
  agent: Agent;
  runtimeContext: RuntimeContext<URPCAgentRuntimeContext>;
  mastraInstance: Mastra;
  input: string;
  proxy?: boolean;
  summary?: boolean;
}): Promise<PlanOutput> {
  try {
    const response = await agent.generate(
      [
        {
          role: "user",
          content: input,
        },
      ],
      {
        runtimeContext,
      }
    );

    if (proxy) {
      return parseAIResponse(response.text);
    } else {
      const output = parseAIResponse(response.text);
      const planOutput = await executeExecutionPlan(output.execution_plan);

      if (summary && planOutput.results.length > 0) {
        const summaryText = await summarizeResults({
          mastraInstance,
          userQuestion: input,
          apiResults: planOutput.results,
        });

        return {
          ...planOutput,
          results: [], // After summarizing and analyzing the data, there is no need to return redundant data.
          summary,
          summaryText,
        };
      }

      return planOutput;
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

function parseAIResponse(agentResponse: string): PlanOutput {
  try {
    const jsonMatch = agentResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.execution_plan) {
        // Process the execution plan to replace generated-id placeholders
        const processedPlan = processExecutionPlan(parsed.execution_plan);
        return {
          execution_plan: processedPlan,
          results: [],
          summary: parsed.summary,
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
      summary: false,
    };
  } catch (error: any) {
    return {
      execution_plan: {
        steps: [],
        total_steps: 0,
      },
      results: [],
      message: `Error occurred while parsing AI response.`,
      summary: false,
    };
  }
}

function processExecutionPlan(executionPlan: ExecutionPlan): ExecutionPlan {
  // Process each step to replace generated-id placeholders
  let userId = "";
  const processedSteps = executionPlan.steps.map((step) => {
    let processedCode = step.urpc_code;
    if (step.urpc_code.includes("create")) {
      if (step.urpc_code.includes("generated-id")) {
        const randomId = generateRandomId();
        processedCode = step.urpc_code.replace(/generated-id/g, randomId);
        if (extractEntity(step.urpc_code).includes("user") && !userId) {
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

async function executeExecutionPlan(
  executionPlan: ExecutionPlan
): Promise<PlanOutput> {
  const results: StepOutput[] = [];

  // Sort steps by order
  const sortedSteps = [...executionPlan.steps].sort(
    (a, b) => a.order - b.order
  );

  for (const step of sortedSteps) {
    try {
      const result = await executeURPCCode(step.urpc_code);
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

async function executeURPCCode(urpcCode: string): Promise<StepOutput> {
  const operation = extractOperation(urpcCode);
  const entity = extractEntity(urpcCode);
  const source = extractSource(urpcCode);
  const options = extractOptions(urpcCode);
  try {
    let data;
    switch (operation) {
      case "findMany": {
        data = await globalURPC.repo({ entity, source }).findMany(options);
        break;
      }
      case "findOne": {
        data = await globalURPC.repo({ entity, source }).findOne(options);
        break;
      }
      case "createMany": {
        data = await globalURPC.repo({ entity, source }).createMany(options);
        break;
      }
      case "create": {
        data = await globalURPC.repo({ entity, source }).create(options);
        break;
      }
      case "updateMany": {
        data = await globalURPC.repo({ entity, source }).updateMany(options);
        break;
      }
      case "update": {
        data = await globalURPC.repo({ entity, source }).update(options);
        break;
      }
      case "upsert": {
        data = await globalURPC.repo({ entity, source }).upsert(options);
        break;
      }
      case "upsertMany": {
        data = await globalURPC.repo({ entity, source }).upsertMany(options);
        break;
      }
      case "delete": {
        data = await globalURPC.repo({ entity, source }).delete(options);
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

function extractOperation(urpcCode: string): string {
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

function extractEntity(urpcCode: string): string {
  const match = urpcCode.match(/entity:\s*"([^"]+)"/);
  return match ? match[1] : "unknown";
}

function extractSource(urpcCode: string): string {
  const match = urpcCode.match(/source:\s*"([^"]+)"/);
  return match ? match[1] : "memory";
}

function extractOptions(urpcCode: string): any {
  // Improved option extraction, supporting all URPC operations
  try {
    // Match parameter part of method call - use more accurate regex to match complete parameters
    const match = urpcCode.match(/\)\.(\w+)\((.+)\)$/);
    if (match) {
      const methodName = match[1];
      if (globalDebug) {
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
        if (globalDebug) {
          console.log(
            "JSON parsing failed, trying improved parsing:",
            paramsStr
          );
        }
        return parseAdvancedObjectString(paramsStr);
      }
    }
    return {};
  } catch (error) {
    console.log("Parameter extraction failed:", error);
    return {};
  }
}

function parseAdvancedObjectString(str: string): any {
  // Improved object string parsing, supporting nested objects
  try {
    // First try to parse using eval in a safe environment (limited to object literals only)
    // But for security, we need to first validate that the string contains only object literal syntax

    if (isValidObjectLiteral(str)) {
      // Use Function constructor to create a function that returns an object
      const func = new Function(`"use strict"; return (${str});`);
      return func();
    }

    // If not a valid object literal, fall back to simple parsing
    return parseSimpleObjectString(str);
  } catch (error) {
    console.log("Improved object parsing failed:", error);
    return parseSimpleObjectString(str);
  }
}

function generateRandomId(): string {
  // Generate random ID - using combination of timestamp and random number
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${randomStr}`;
}

function isValidObjectLiteral(str: string): boolean {
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

function parseSimpleObjectString(str: string): any {
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

export async function streamResponse({
  agent,
  runtimeContext,
  mastraInstance,
  input,
  proxy,
  summary,
}: {
  agent: Agent;
  runtimeContext: RuntimeContext<URPCAgentRuntimeContext>;
  mastraInstance: Mastra;
  input: string;
  proxy?: boolean;
  summary?: boolean;
}): Promise<ReadableStream> {
  try {
    const aiStream = await agent.stream(
      [
        {
          role: "user",
          content: input,
        },
      ],
      {
        runtimeContext,
      }
    );

    if (proxy) {
      return aiStream.textStream;
    }

    let aiResponseBuffer = "";
    let executionStarted = false;

    return new ReadableStream({
      async start(controller) {
        try {
          const reader = aiStream.textStream.getReader();

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            aiResponseBuffer += value;

            const chunk =
              JSON.stringify({
                type: "ai_response",
                content: value,
                timestamp: Date.now(),
              }) + "\n";
            controller.enqueue(new TextEncoder().encode(chunk));
          }

          if (!executionStarted) {
            executionStarted = true;

            const output = parseAIResponse(aiResponseBuffer);

            const planChunk =
              JSON.stringify({
                type: "execution_plan",
                content: output.execution_plan,
                summary: summary,
                timestamp: Date.now(),
              }) + "\n";
            controller.enqueue(new TextEncoder().encode(planChunk));

            await streamExecuteExecutionPlan(
              mastraInstance,
              output.execution_plan,
              controller,
              input,
              summary || false
            );
          }

          controller.close();
        } catch (error: any) {
          const errorChunk =
            JSON.stringify({
              type: "error",
              content: `Stream processing error: ${error.message}`,
              timestamp: Date.now(),
            }) + "\n";
          controller.enqueue(new TextEncoder().encode(errorChunk));
          controller.close();
        }
      },
    });
  } catch (error: any) {
    return new ReadableStream({
      start(controller) {
        const errorChunk =
          JSON.stringify({
            type: "error",
            content: `Error occurred while processing request: ${error.message}`,
            timestamp: Date.now(),
          }) + "\n";
        controller.enqueue(new TextEncoder().encode(errorChunk));
        controller.close();
      },
    });
  }
}

async function streamExecuteExecutionPlan(
  mastraInstance: Mastra,
  executionPlan: ExecutionPlan,
  controller: ReadableStreamDefaultController,
  userQuestion: string,
  summary: boolean
): Promise<void> {
  const results: StepOutput[] = [];

  const processedPlan = processExecutionPlan(executionPlan);

  const sortedSteps = [...processedPlan.steps].sort(
    (a, b) => a.order - b.order
  );

  for (const step of sortedSteps) {
    try {
      const executingChunk =
        JSON.stringify({
          type: "executing",
          content: `In progress: ${step.description}`,
          timestamp: Date.now(),
        }) + "\n";
      controller.enqueue(new TextEncoder().encode(executingChunk));

      const result = await executeURPCCode(step.urpc_code);
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

      const errorChunk =
        JSON.stringify({
          type: "executing",
          content: `Failed: ${step.description} - ${error.message}`,
          timestamp: Date.now(),
        }) + "\n";
      controller.enqueue(new TextEncoder().encode(errorChunk));
    }
  }

  const finalResult: PlanOutput = {
    execution_plan: processedPlan,
    results: summary ? [] : results, // After summarizing and analyzing the data, there is no need to return redundant data.
  };

  if (summary && results.length > 0) {
    try {
      const summaryText = await summarizeResults({
        mastraInstance,
        userQuestion,
        apiResults: results,
      });

      finalResult.summary = true;
      finalResult.summaryText = summaryText;

      const summaryChunk =
        JSON.stringify({
          type: "summary",
          content: summaryText,
          timestamp: Date.now(),
        }) + "\n";
      controller.enqueue(new TextEncoder().encode(summaryChunk));
    } catch (error: any) {
      const summaryErrorChunk =
        JSON.stringify({
          type: "summary_error",
          content: `Summary generation failed: ${error.message}`,
          timestamp: Date.now(),
        }) + "\n";
      controller.enqueue(new TextEncoder().encode(summaryErrorChunk));
    }
  }

  const finalChunk =
    JSON.stringify({
      type: "final_result",
      content: finalResult,
      timestamp: Date.now(),
    }) + "\n";
  controller.enqueue(new TextEncoder().encode(finalChunk));
}

async function summarizeResults({
  mastraInstance,
  userQuestion,
  apiResults,
}: {
  mastraInstance: Mastra;
  userQuestion: string;
  apiResults: any;
  model?: string;
  openrouterApiKey?: string;
}): Promise<string> {
  const summaryAgent = mastraInstance.getAgent("summaryAgent");

  try {
    const response = await summaryAgent.generate([
      {
        role: "user",
        content: `
User Question:
${userQuestion}

API Execution Results:
${JSON.stringify(apiResults, null, 2)}

Please summarize the above results.`,
      },
    ]);
    return response.text;
  } catch (error: any) {
    return `Summary generation failed: ${error.message}`;
  }
}

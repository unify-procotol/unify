import { URPC } from "@unilab/urpc";
import { ExecutionPlan, Output, PlanOutput } from "./type";

export async function executeExecutionPlan(
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
      const result = await executeURPCCode(step.urpc_code);
      results.push({
        ...result,
        message: `Step ${step.order}: ${step.description} - ${
          result.message || (result.success ? "success" : "failure")
        }`,
      });

      if (!result.success) {
        allSuccess = false;
        combinedMessage += `Step ${step.order} failure: ${result.message};\n `;
      } else {
        combinedMessage += `Step ${step.order} success: ${step.description}; \n`;
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
    results,
  };
}

export async function executeURPCCode(urpcCode: string): Promise<Output> {
  const operation = extractOperation(urpcCode);
  const entity = extractEntity(urpcCode);
  const source = extractSource(urpcCode);
  const options = extractOptions(urpcCode);
  try {
    let data;
    switch (operation) {
      case "findMany": {
        data = await URPC.repo({ entity, source }).findMany(options);
        break;
      }
      case "findOne": {
        data = await URPC.repo({ entity, source }).findOne(options);
        break;
      }
      case "createMany": {
        data = await URPC.repo({ entity, source }).createMany(options);
        break;
      }
      case "create": {
        data = await URPC.repo({ entity, source }).create(options);
        break;
      }
      case "updateMany": {
        data = await URPC.repo({ entity, source }).updateMany(options);
        break;
      }
      case "update": {
        data = await URPC.repo({ entity, source }).update(options);
        break;
      }
      case "upsert": {
        data = await URPC.repo({ entity, source }).upsert(options);
        break;
      }
      case "upsertMany": {
        data = await URPC.repo({ entity, source }).upsertMany(options);
        break;
      }
      case "delete": {
        data = await URPC.repo({ entity, source }).delete(options);
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
  if (urpcCode.includes("upsert")) return "upsert";
  if (urpcCode.includes("delete")) return "delete";
  if (urpcCode.includes("call")) return "call";
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

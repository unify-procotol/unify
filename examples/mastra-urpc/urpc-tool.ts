import { repo } from "@unilab/urpc";
import { generateSchemas, Plugin, WhereCondition } from "@unilab/urpc-core";
import { createTool } from "@mastra/core/tools";
import { Agent } from "@mastra/core";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { config } from "dotenv";

config({ path: ".env" });

export interface URPCToolConfig {
  id: string;
  description: string;
  plugin: Plugin;
  schemas: Record<string, any>;
  customInputSchema?: z.ZodObject<any>;
  executeFunction: (context: any, repoFunctions: any) => Promise<any>;
}

export interface RepoFunction {
  findOne: (whereConditions: WhereCondition<any>) => Promise<any>;
  findMany: (whereConditions?: WhereCondition<any>) => Promise<any[]>;
}

/**
 * Creates a universal urpc tool that can automatically parse plugin information
 * and generate repository calls dynamically
 */
export function createURPCTool(config: URPCToolConfig) {
  const {
    id,
    description,
    plugin,
    schemas,
    customInputSchema,
    executeFunction,
  } = config;

  // Use custom input schema if provided, otherwise generate from plugin entities
  let inputSchema = customInputSchema;

  if (!inputSchema) {
    const inputSchemaProperties: Record<string, any> = {};

    if (plugin.entities) {
      for (const EntityClass of plugin.entities) {
        const entityName = EntityClass.name;
        const entitySchema = schemas[entityName];

        if (entitySchema && entitySchema.properties) {
          for (const [fieldName, fieldSchema] of Object.entries(
            entitySchema.properties
          )) {
            // Skip result fields as they are outputs
            if (
              fieldName !== "result" &&
              typeof fieldSchema === "object" &&
              fieldSchema !== null
            ) {
              const field = fieldSchema as any;
              inputSchemaProperties[`${entityName}_${fieldName}`] = {
                type: field.type === "number" ? z.number() : z.string(),
                description:
                  field.description ||
                  `${fieldName} parameter for ${entityName}`,
                optional: !entitySchema.required?.includes(fieldName),
              };
            }
          }
        }
      }
    }

    inputSchema = z.object(
      Object.fromEntries(
        Object.entries(inputSchemaProperties).map(([key, value]) => [
          key,
          value.optional ? value.type.optional() : value.type,
        ])
      )
    );
  }

  // Generate repository functions with enhanced error handling
  const repoFunctions = createRepoFunctions(plugin);

  return createTool({
    id,
    description,
    inputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      data: z.any(),
      message: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const result = await executeFunction(context, repoFunctions);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error(`Error in ${id}:`, error);
        return {
          success: false,
          data: null,
          message: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
}

/**
 * Creates repository functions from a plugin configuration
 * These functions provide a simplified interface to interact with entities
 */
export function createRepoFunctions(
  plugin: Plugin
): Record<string, RepoFunction> {
  const repoFunctions: Record<string, RepoFunction> = {};

  if (plugin.adapters) {
    for (const adapterReg of plugin.adapters) {
      const entityNameKey = adapterReg.entity
        .replace(/Entity$/i, "")
        .toLowerCase();
      repoFunctions[entityNameKey] = {
        findOne: async (whereConditions: any) => {
          try {
            return await repo<any>({
              entity: entityNameKey,
              source: adapterReg.source,
            }).findOne({ where: whereConditions });
          } catch (error) {
            console.error(`Error in ${entityNameKey}.findOne:`, error);
            throw error;
          }
        },
        findMany: async (whereConditions?: any) => {
          try {
            return await repo<any>({
              entity: entityNameKey,
              source: adapterReg.source,
            }).findMany(whereConditions ? { where: whereConditions } : {});
          } catch (error) {
            console.error(`Error in ${entityNameKey}.findMany:`, error);
            throw error;
          }
        },
      };
    }
  }

  return repoFunctions;
}

/**
 * Utility function to generate schemas from plugin entities
 */
export function generatePluginSchemas(plugin: Plugin): Record<string, any> {
  if (!plugin.entities) {
    return {};
  }

  return generateSchemas(plugin.entities);
}

/**
 * Utility function to analyze schema and create generic input parameters
 */
export function analyzeSchemaFields(schemas: Record<string, any>): {
  inputFields: Record<string, any>;
  entityCapabilities: Record<string, string[]>;
} {
  const inputFields: Record<string, any> = {};
  const entityCapabilities: Record<string, string[]> = {};

  Object.entries(schemas).forEach(([entityName, schema]) => {
    const capabilities: string[] = [];

    if (schema?.properties) {
      Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
        const field = fieldSchema as any;

        // Skip result fields - they are response data, not query parameters
        if (fieldName === "result") return;

        // Only process simple types as query parameters
        // Complex types (custom objects, arrays) are typically response data
        const isSimpleType =
          field.type === "string" ||
          field.type === "number" ||
          field.type === "boolean";

        if (isSimpleType) {
          const fieldKey = `${entityName.toLowerCase()}_${fieldName}`;

          // Determine field type and create zod schema
          let zodType: any;
          if (field.type === "number") {
            zodType = z.number();
          } else if (field.type === "boolean") {
            zodType = z.boolean();
          } else {
            zodType = z.string();
          }

          // Check if field is required
          const isRequired = schema.required?.includes(fieldName) || false;

          inputFields[fieldKey] = {
            type: isRequired ? zodType : zodType.optional(),
            description:
              field.description || `${fieldName} parameter for ${entityName}`,
            entityName,
            fieldName,
          };

          // Extract capabilities dynamically based on schema structure
          // Add normalized field name as capability
          capabilities.push(fieldName.toLowerCase());

          // Extract meaningful terms from field description
          if (field.description) {
            const meaningfulWords =
              field.description.toLowerCase().match(/\b[a-zA-Z]{3,}\b/g) || [];
            capabilities.push(...meaningfulWords);
          }

          // Add field type as capability
          capabilities.push(field.type);
        }
      });
    }

    if (capabilities.length > 0) {
      entityCapabilities[entityName.toLowerCase()] = Array.from(
        new Set(capabilities)
      );
    }
  });

  return { inputFields, entityCapabilities };
}

/**
 * Example usage and utility functions
 */
export class URPCToolBuilder {
  private plugin: Plugin;
  private schemas: Record<string, any>;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.schemas = generatePluginSchemas(plugin);
  }

  /**
   * Get the generated schemas
   */
  getSchemas() {
    return this.schemas;
  }

  /**
   * Get repository functions
   */
  getRepoFunctions() {
    return createRepoFunctions(this.plugin);
  }

  /**
   * Create a tool with custom configuration
   */
  createTool(config: Omit<URPCToolConfig, "plugin" | "schemas">) {
    return createURPCTool({
      ...config,
      plugin: this.plugin,
      schemas: this.schemas,
    });
  }

  /**
   * Create a generic tool based on schema analysis
   */
  createGenericTool(config: {
    id: string;
    description: string;
    executeFunction: (
      context: any,
      repoFunctions: any,
      schemas: any
    ) => Promise<any>;
  }) {
    const { inputFields } = analyzeSchemaFields(this.schemas);

    // Create input schema from analyzed fields
    const inputSchema = z.object(
      Object.fromEntries(
        Object.entries(inputFields).map(([key, field]) => [
          key,
          (field as any).type.describe((field as any).description),
        ])
      )
    );

    return createURPCTool({
      id: config.id,
      description: config.description,
      plugin: this.plugin,
      schemas: this.schemas,
      customInputSchema: inputSchema,
      executeFunction: async (context, repoFunctions) => {
        return await config.executeFunction(
          context,
          repoFunctions,
          this.schemas
        );
      },
    });
  }
}

/**
 * AI-Driven Smart URPC Tool
 *
 * This tool automatically analyzes plugin structure and user queries to:
 * 1. Determine which entities are needed
 * 2. Understand dependencies between entities
 * 3. Generate execution plans automatically
 * 4. Handle complex multi-step queries
 */

export interface EntityMetadata {
  name: string;
  entity: string;
  source: string;
  adapter: any;
  schema: any;
  dependencies: string[];
  capabilities: string[];
}

export interface QueryPlan {
  steps: QueryStep[];
  finalOutput: any;
}

export interface QueryStep {
  entity: string;
  operation: "findOne" | "findMany";
  parameters: any;
  dependsOn?: string[];
  outputMapping?: Record<string, string>;
}

export class SmartURPCTool {
  private plugin: Plugin;
  private schemas: Record<string, any>;
  private entityMetadata: Map<string, EntityMetadata>;
  private repoFunctions: Record<string, RepoFunction>;
  private aiAgent: Agent;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.schemas = generatePluginSchemas(plugin);
    this.entityMetadata = new Map();
    this.repoFunctions = createRepoFunctions(plugin);

    // Initialize AI agent for parameter extraction
    this.aiAgent = new Agent({
      name: "Parameter Extraction Agent",
      instructions: `
        You are a parameter extraction specialist. Your job is to extract specific parameter values from user queries based on field descriptions and context.
        
        Always return ONLY the extracted value or null if not found. No explanations or additional text.
      `,
      model: createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY!,
      }).chat("openai/gpt-4o-mini"),
    });

    this.analyzePlugin();
  }

  /**
   * Analyze plugin structure and create entity metadata
   */
  private analyzePlugin() {
    if (!this.plugin.entities || !this.plugin.adapters) {
      return;
    }

    // Create entity metadata map
    for (const EntityClass of this.plugin.entities) {
      const entityName = EntityClass.name;
      const entityKey = entityName.replace(/Entity$/i, "").toLowerCase();

      // Find corresponding adapter
      const adapterReg = this.plugin.adapters.find(
        (a) => a.entity === entityName
      );
      if (!adapterReg) continue;

      const schema = this.schemas[entityName];

      // Analyze schema to determine capabilities and dependencies
      const capabilities = this.analyzeCapabilities(schema);
      const dependencies = this.analyzeDependencies(schema, capabilities);

      const metadata: EntityMetadata = {
        name: entityKey,
        entity: entityName,
        source: adapterReg.source,
        adapter: adapterReg.adapter,
        schema,
        dependencies,
        capabilities,
      };

      this.entityMetadata.set(entityKey, metadata);
    }

    // Resolve placeholder dependencies after all entities are analyzed
    this.resolvePlaceholderDependencies();
  }

  /**
   * Analyze what capabilities an entity has based on its schema
   */
  private analyzeCapabilities(schema: any): string[] {
    const capabilities: string[] = [];

    if (!schema || !schema.properties) return capabilities;

    // Analyze all fields to extract capabilities dynamically
    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      const field = fieldSchema as any;

      // Skip result field as it's response data, not input capability
      if (fieldName === "result") continue;

      // Only analyze simple types as they represent query parameters/capabilities
      if (
        field.type !== "string" &&
        field.type !== "number" &&
        field.type !== "boolean"
      ) {
        continue;
      }

      // Add field name as capability (normalized)
      capabilities.push(fieldName.toLowerCase());

      // Add field type as capability
      capabilities.push(field.type);

      // Extract capabilities from field description
      if (field.description) {
        const meaningfulWords =
          field.description.toLowerCase().match(/\b[a-zA-Z]{3,}\b/g) || [];
        capabilities.push(...meaningfulWords);
      }
    }

    return Array.from(new Set(capabilities)); // Remove duplicates
  }

  /**
   * Analyze dependencies between entities based on their schema requirements
   * Look at what fields are required vs what other entities can provide
   */
  private analyzeDependencies(schema: any, capabilities: string[]): string[] {
    const dependencies: string[] = [];

    if (!schema || !schema.required) return dependencies;

    // Check if this entity requires fields that might be provided by other entities
    // We'll resolve these after all entities are analyzed
    for (const requiredField of schema.required) {
      // Skip the result field itself
      if (requiredField === "result") continue;

      // Mark that this entity needs this field to be provided
      dependencies.push(`__needs_${requiredField}__`);
    }

    return dependencies;
  }

  /**
   * Resolve placeholder dependencies after all entities are analyzed
   * Match required fields with entities that can provide them
   */
  private resolvePlaceholderDependencies() {
    for (const [entityName, metadata] of Array.from(
      this.entityMetadata.entries()
    )) {
      const resolvedDependencies: string[] = [];

      for (const dep of metadata.dependencies) {
        if (dep.startsWith("__needs_") && dep.endsWith("__")) {
          // Extract the field name from the placeholder
          const fieldName = dep.slice(8, -2); // Remove "__needs_" and "__"

          // Find entities that can provide this field (have it in their result schema)
          for (const [providerEntityName, providerMetadata] of Array.from(
            this.entityMetadata.entries()
          )) {
            if (providerEntityName === entityName) continue; // Skip self

            // Check if this provider entity has a result that contains the needed field
            const providerSchema = providerMetadata.schema;
            if (providerSchema?.properties?.result) {
              const resultType = providerSchema.properties.result.type;
              const resultSchema = this.schemas[resultType];

              // Check if the result schema has the field we need
              if (resultSchema?.properties?.[fieldName]) {
                resolvedDependencies.push(providerEntityName);
                break; // Found a provider, no need to check others for this field
              }
            }
          }
        } else {
          // Keep non-placeholder dependencies as-is
          resolvedDependencies.push(dep);
        }
      }

      metadata.dependencies = Array.from(new Set(resolvedDependencies));
    }
  }

  /**
   * Create an intelligent tool that can handle various query types
   */
  createSmartTool(config: {
    id: string;
    description: string;
    customInputSchema?: z.ZodObject<any>;
  }) {
    const inputSchema =
      config.customInputSchema ||
      z.object({
        query: z
          .string()
          .describe(
            "Natural language query describing what information you need"
          ),
        parameters: z
          .record(z.any())
          .optional()
          .describe("Additional parameters for the query"),
      });

    return createTool({
      id: config.id,
      description: config.description,
      inputSchema,
      outputSchema: z.object({
        success: z.boolean(),
        data: z.any(),
        message: z.string().optional(),
        plan: z.any().optional(),
      }),
      execute: async ({ context }) => {
        try {
          const plan = await this.generateQueryPlan(context);
          const result = await this.executeQueryPlan(plan);

          return {
            success: true,
            data: result,
            plan: plan,
          };
        } catch (error) {
          console.error(`Error in ${config.id}:`, error);
          return {
            success: false,
            data: null,
            message: error instanceof Error ? error.message : String(error),
          };
        }
      },
    });
  }

  /**
   * Generate a query execution plan based on user input
   */
  private async generateQueryPlan(context: any): Promise<QueryPlan> {
    const steps: QueryStep[] = [];

    // Analyze the query to determine what entities are needed
    const requiredEntities = this.analyzeQueryIntention(context);

    // Generate execution steps with dependency ordering
    const entityOrder = this.resolveDependencies(requiredEntities);

    for (const entityName of entityOrder) {
      const metadata = this.entityMetadata.get(entityName);
      if (!metadata) continue;

      const step: QueryStep = {
        entity: entityName,
        operation: "findOne", // Default operation
        parameters: await this.extractParametersForEntity(context, metadata),
        dependsOn: metadata.dependencies,
      };

      steps.push(step);
    }

    return {
      steps,
      finalOutput: this.determineFinalOutput(requiredEntities),
    };
  }

  /**
   * Analyze user query to determine which entities are needed based on capabilities
   */
  private analyzeQueryIntention(context: any): string[] {
    const requiredEntities: string[] = [];

    // Parse query text or parameters to understand intention
    const queryText = context.query?.toLowerCase() || "";
    const parameters = context.parameters || {};

    // Match query keywords with entity capabilities
    for (const [entityName, metadata] of Array.from(
      this.entityMetadata.entries()
    )) {
      let isNeeded = false;

      // Check if query matches any capability
      for (const capability of metadata.capabilities) {
        if (queryText.includes(capability)) {
          isNeeded = true;
          break;
        }
      }

      // Check if parameters match entity fields
      if (!isNeeded && metadata.schema?.properties) {
        for (const fieldName of Object.keys(metadata.schema.properties)) {
          const paramKey = `${entityName}_${fieldName}`;
          if (parameters[paramKey] !== undefined) {
            isNeeded = true;
            break;
          }
        }
      }

      // Check for direct entity mentions
      if (!isNeeded && queryText.includes(entityName)) {
        isNeeded = true;
      }

      if (isNeeded) {
        requiredEntities.push(entityName);
      }
    }

    // If no entities matched, use entities with most capabilities as fallback
    if (requiredEntities.length === 0) {
      // Find entities that have capabilities (can potentially handle queries)
      const entitiesWithCapabilities: Array<{
        name: string;
        capabilityCount: number;
      }> = [];

      for (const [entityName, metadata] of Array.from(
        this.entityMetadata.entries()
      )) {
        if (metadata.capabilities.length > 0) {
          entitiesWithCapabilities.push({
            name: entityName,
            capabilityCount: metadata.capabilities.length,
          });
        }
      }

      // Sort by capability count and take the most capable entities
      entitiesWithCapabilities.sort(
        (a, b) => b.capabilityCount - a.capabilityCount
      );

      // Add the most capable entity if available
      if (entitiesWithCapabilities.length > 0) {
        requiredEntities.push(entitiesWithCapabilities[0].name);
      }
    }

    return requiredEntities;
  }

  /**
   * Resolve dependencies and return entities in execution order
   */
  private resolveDependencies(requiredEntities: string[]): string[] {
    const resolved: string[] = [];
    const visited = new Set<string>();

    const visit = (entity: string) => {
      if (visited.has(entity)) return;
      visited.add(entity);

      const metadata = this.entityMetadata.get(entity);
      if (metadata) {
        // First resolve dependencies
        for (const dep of metadata.dependencies) {
          if (requiredEntities.includes(dep)) {
            visit(dep);
          }
        }
        // Then add the entity itself
        resolved.push(entity);
      }
    };

    for (const entity of requiredEntities) {
      visit(entity);
    }

    return resolved;
  }

  /**
   * Extract parameters for a specific entity from user context based on schema
   */
  private async extractParametersForEntity(
    context: any,
    metadata: EntityMetadata
  ): Promise<any> {
    const parameters: any = {};
    const queryText = context.query?.toLowerCase() || "";
    const userParams = context.parameters || {};

    // Extract parameters based on schema properties - only simple types are query parameters
    if (metadata.schema?.properties) {
      for (const [fieldName, fieldSchema] of Object.entries(
        metadata.schema.properties
      )) {
        const field = fieldSchema as any;

        // Skip result fields and complex types
        if (
          fieldName === "result" ||
          (field.type !== "string" &&
            field.type !== "number" &&
            field.type !== "boolean")
        ) {
          continue;
        }

        // Check if user provided this parameter directly
        const paramKey = `${metadata.name}_${fieldName}`;
        if (userParams[paramKey] !== undefined) {
          parameters[fieldName] = userParams[paramKey];
          continue;
        }

        // Use AI to extract parameter value
        const extractedValue = await this.extractParameterWithAI(
          fieldName,
          field,
          queryText,
          context,
          metadata
        );

        if (extractedValue !== undefined) {
          parameters[fieldName] = extractedValue;
        }
      }
    }

    return parameters;
  }

  /**
   * AI-powered parameter extraction using mastra's intelligence
   */
  private async extractParameterWithAI(
    fieldName: string,
    fieldSchema: any,
    queryText: string,
    context: any,
    metadata: EntityMetadata
  ): Promise<any> {
    const fieldType = fieldSchema.type;
    const fieldDescription = fieldSchema.description || "";
    const userParams = context.parameters || {};

    // Check if user provided this parameter directly
    if (userParams[fieldName] !== undefined) {
      return userParams[fieldName];
    }

    // Create an AI prompt to extract the parameter
    const extractionPrompt = this.createParameterExtractionPrompt(
      fieldName,
      fieldType,
      fieldDescription,
      queryText,
      context,
      metadata
    );

    console.log(
      "============= Extraction prompt ============== \n",
      extractionPrompt
    );

    // Use AI to extract the parameter value
    return await this.executeAIParameterExtraction(extractionPrompt, fieldType);
  }

  /**
   * Create a detailed prompt for AI parameter extraction
   */
  private createParameterExtractionPrompt(
    fieldName: string,
    fieldType: string,
    fieldDescription: string,
    queryText: string,
    context: any,
    metadata: EntityMetadata
  ): string {
    return `
Context: User query is "${context.query}"
Entity: ${metadata.entity}
Field: ${fieldName}
Field Type: ${fieldType}
Field Description: ${fieldDescription}
Schema: ${JSON.stringify(metadata.schema, null, 2)}

Task: Extract the value for the field "${fieldName}" from the user query.

Guidelines:
1. The field type is "${fieldType}"
2. The field description is: "${fieldDescription}"
3. If the query doesn't contain relevant information for this field, return null
4. For string fields, extract the most relevant text value
5. For number fields, extract numeric values
6. For boolean fields, infer true/false based on context
7. Consider the field's purpose within the entity context

${
  fieldDescription.includes("e.g.")
    ? `Default/Example value from description: ${fieldDescription.match(/e\.g\.\s*([^,\n]+)/)?.[1]?.trim()}`
    : ""
}

Return only the extracted value or null if not found.
    `.trim();
  }

  /**
   * Execute AI parameter extraction using real AI capabilities
   */
  private async executeAIParameterExtraction(
    prompt: string,
    fieldType: string
  ): Promise<any> {
    try {
      // Use mastra's AI agent to extract parameters
      const response = await this.aiAgent.generate([
        {
          role: "user",
          content: prompt,
        },
      ]);

      const result = response.text.trim();

      // Handle null/empty responses - check for default values in prompt
      if (
        !result ||
        result.toLowerCase() === "null" ||
        result.toLowerCase() === "none"
      ) {
        // Try to extract default value from the prompt
        const defaultValueMatch = prompt.match(
          /Default\/Example value from description: ([^\n]+)/
        );
        if (defaultValueMatch) {
          const defaultValue = defaultValueMatch[1].trim();
          console.log(`🔄 Using default value: ${defaultValue}`);
          return defaultValue;
        }
        return undefined;
      }

      // Parse result based on field type
      switch (fieldType) {
        case "string":
          return result;
        case "number":
          const numValue = parseFloat(result);
          return isNaN(numValue) ? undefined : numValue;
        case "boolean":
          const lowerResult = result.toLowerCase();
          if (lowerResult === "true") return true;
          if (lowerResult === "false") return false;
          return undefined;
        default:
          return result;
      }
    } catch (error) {
      console.error("❌ AI parameter extraction failed:", error);
      // Fallback to simple extraction if AI fails
      return this.fallbackParameterExtraction(prompt, fieldType);
    }
  }

  /**
   * Fallback parameter extraction when AI is not available
   */
  private fallbackParameterExtraction(prompt: string, fieldType: string): any {
    // Extract the query from the prompt
    const queryMatch = prompt.match(/User query is "([^"]+)"/);
    const query = queryMatch ? queryMatch[1].toLowerCase() : "";

    // Extract field information
    const fieldNameMatch = prompt.match(/Field: (\w+)/);
    const fieldName = fieldNameMatch ? fieldNameMatch[1] : "";

    const fieldDescMatch = prompt.match(/Field Description: ([^\n]+)/);
    const fieldDescription = fieldDescMatch
      ? fieldDescMatch[1].toLowerCase()
      : "";

    // Check for default values in the prompt first
    const defaultValueMatch = prompt.match(
      /Default\/Example value from description: ([^\n]+)/
    );
    if (defaultValueMatch) {
      const defaultValue = defaultValueMatch[1].trim();
      console.log(`🔄 Using fallback default value: ${defaultValue}`);
      return defaultValue;
    }

    // Simple fallback logic
    if (fieldType === "string") {
      return this.inferStringValue(query, fieldName, fieldDescription);
    } else if (fieldType === "number") {
      return this.inferNumberValue(query, fieldName, fieldDescription);
    } else if (fieldType === "boolean") {
      return this.inferBooleanValue(query, fieldName, fieldDescription);
    }

    return undefined;
  }

  /**
   * Infer string value from query using AI-like logic
   */
  private inferStringValue(
    query: string,
    fieldName: string,
    fieldDescription: string
  ): string | undefined {
    // If field description has examples, extract similar patterns
    if (fieldDescription.includes("e.g.")) {
      const exampleMatch = fieldDescription.match(/e\.g\.\s*([^,\n]+)/);
      if (exampleMatch) {
        return exampleMatch[1].trim();
      }
    }

    // Look for field name in query
    const fieldPattern = new RegExp(`${fieldName}\\s*:?\\s*([^\\s,]+)`, "i");
    const match = query.match(fieldPattern);
    if (match) {
      return match[1];
    }

    return undefined;
  }

  /**
   * Infer number value from query using AI-like logic
   */
  private inferNumberValue(
    query: string,
    fieldName: string,
    fieldDescription: string
  ): number | undefined {
    // Look for numbers in the query
    const numberPattern = new RegExp(`${fieldName}\\s*:?\\s*([0-9.-]+)`, "i");
    const match = query.match(numberPattern);
    if (match) {
      return parseFloat(match[1]);
    }

    // Generic number extraction
    const numbers = query.match(/\b\d+(?:\.\d+)?\b/g);
    if (numbers && numbers.length > 0) {
      return parseFloat(numbers[0]);
    }

    return undefined;
  }

  /**
   * Infer boolean value from query using AI-like logic
   */
  private inferBooleanValue(
    query: string,
    fieldName: string,
    fieldDescription: string
  ): boolean | undefined {
    const trueKeywords = ["true", "yes", "on", "enable", "enabled"];
    const falseKeywords = ["false", "no", "off", "disable", "disabled"];

    for (const keyword of trueKeywords) {
      if (query.includes(keyword)) {
        return true;
      }
    }

    for (const keyword of falseKeywords) {
      if (query.includes(keyword)) {
        return false;
      }
    }

    return undefined;
  }

  /**
   * Map parameters from dependency result to target entity parameters
   */
  private mapParametersFromDependency(
    targetParameters: any,
    dependencyResult: any,
    dependencyEntityName: string,
    targetEntityName: string
  ) {
    const depMetadata = this.entityMetadata.get(dependencyEntityName);
    const targetMetadata = this.entityMetadata.get(targetEntityName);

    if (!depMetadata || !targetMetadata) return;

    // Get target entity schema to understand what parameters it needs
    const targetSchema = targetMetadata.schema;
    if (!targetSchema?.properties) return;

    // Map parameters based on field names and types, not hardcoded strings
    for (const [fieldName, fieldSchema] of Object.entries(
      targetSchema.properties
    )) {
      if (fieldName === "result") continue;

      const field = fieldSchema as any;

      // Only map to simple type fields (query parameters)
      if (
        field.type !== "string" &&
        field.type !== "number" &&
        field.type !== "boolean"
      ) {
        continue;
      }

      // Try to map by exact field name first
      if (dependencyResult[fieldName] !== undefined) {
        targetParameters[fieldName] = dependencyResult[fieldName];
        continue;
      }

      // For each target field, search through all dependency result fields for potential matches
      for (const [resultKey, resultValue] of Object.entries(dependencyResult)) {
        if (resultValue !== undefined && resultValue !== null) {
          // Map based on field type compatibility
          if (field.type === typeof resultValue) {
            targetParameters[fieldName] = resultValue;
            break;
          }
        }
      }
    }
  }

  /**
   * Execute the generated query plan
   */
  private async executeQueryPlan(plan: QueryPlan): Promise<any> {
    const stepResults: Record<string, any> = {};

    for (const step of plan.steps) {
      console.log(`🔄 Executing step: ${step.entity}.${step.operation}`);

      // Update parameters with results from previous steps
      let parameters = { ...step.parameters };
      console.log(`📋 Initial parameters:`, parameters);

      // Handle dependencies - Generic parameter mapping based on capabilities
      if (step.dependsOn) {
        for (const depName of step.dependsOn) {
          const depResult = stepResults[depName];
          if (depResult && depResult.result) {
            console.log(`🔗 Mapping from ${depName} result:`, depResult.result);
            // Automatically map parameters based on entity capabilities and schema
            this.mapParametersFromDependency(
              parameters,
              depResult.result,
              depName,
              step.entity
            );
          }
        }
      }

      console.log(`🎯 Final parameters for ${step.entity}:`, parameters);

      // Execute the step
      const repoFunction = this.repoFunctions[step.entity];
      if (!repoFunction) {
        throw new Error(`No repository function found for ${step.entity}`);
      }

      let result: any;
      try {
        switch (step.operation) {
          case "findOne":
            result = await repoFunction.findOne(parameters);
            break;
          case "findMany":
            result = await repoFunction.findMany(parameters);
            break;
          default:
            throw new Error(`Unsupported operation: ${step.operation}`);
        }
        console.log(`✅ Step completed: ${step.entity}`, result ? "✓" : "✗");
        console.log(`📤 Result:`, result);
      } catch (error) {
        console.log(`❌ Step failed: ${step.entity}`, error);
        throw error;
      }

      stepResults[step.entity] = result;
    }

    // Return the final result based on plan
    return this.formatFinalResult(stepResults, plan);
  }

  /**
   * Format the final result based on the execution plan and entity capabilities
   */
  private formatFinalResult(
    stepResults: Record<string, any>,
    plan: QueryPlan
  ): any {
    const combinedResult: any = {
      success: true,
      data: {},
      metadata: {
        executionPlan: plan,
        entitiesUsed: Object.keys(stepResults),
      },
    };

    // Combine all step results into a structured format
    for (const [entityName, result] of Object.entries(stepResults)) {
      if (result?.result) {
        combinedResult.data[entityName] = result.result;
      } else {
        combinedResult.data[entityName] = result;
      }
    }

    // If we have multiple entities, try to create a more structured result
    if (Object.keys(stepResults).length > 1) {
      // Find the primary entity (usually the one with most capabilities)
      let primaryEntity = "";
      let maxCapabilities = 0;

      for (const entityName of Object.keys(stepResults)) {
        const metadata = this.entityMetadata.get(entityName);
        if (metadata && metadata.capabilities.length > maxCapabilities) {
          maxCapabilities = metadata.capabilities.length;
          primaryEntity = entityName;
        }
      }

      if (primaryEntity) {
        combinedResult.primaryResult = combinedResult.data[primaryEntity];
        combinedResult.supportingData = Object.fromEntries(
          Object.entries(combinedResult.data).filter(
            ([key]) => key !== primaryEntity
          )
        );
      }
    } else {
      // Single entity result
      const entityName = Object.keys(stepResults)[0];
      return stepResults[entityName];
    }

    return combinedResult;
  }

  /**
   * Determine what the final output should be
   */
  private determineFinalOutput(requiredEntities: string[]): any {
    // This could be expanded to define different output formats
    // based on the combination of entities used
    return {
      type: "combined",
      entities: requiredEntities,
    };
  }

  /**
   * Get information about available entities and their capabilities
   */
  getEntityInfo() {
    const info: Record<string, any> = {};

    for (const [key, metadata] of Array.from(this.entityMetadata.entries())) {
      info[key] = {
        capabilities: metadata.capabilities,
        dependencies: metadata.dependencies,
        schema: metadata.schema,
      };
    }

    return info;
  }
}

/**
 * Enhanced URPCToolBuilder with smart capabilities
 */
export class EnhancedURPCToolBuilder extends URPCToolBuilder {
  private smartTool: SmartURPCTool;

  constructor(plugin: Plugin) {
    super(plugin);
    this.smartTool = new SmartURPCTool(plugin);
  }

  /**
   * Create a smart AI-driven tool that automatically handles queries
   */
  createSmartTool(config: {
    id: string;
    description: string;
    customInputSchema?: z.ZodObject<any>;
  }) {
    return this.smartTool.createSmartTool(config);
  }

  /**
   * Get information about available entities and their capabilities
   */
  getEntityInfo() {
    return this.smartTool.getEntityInfo();
  }

  /**
   * Create a completely generic tool that handles any query based on available entities
   */
  createUniversalTool(config: { id: string; description: string }) {
    return this.createSmartTool({
      id: config.id,
      description: config.description,
      customInputSchema: z.object({
        query: z
          .string()
          .describe("Natural language query describing what you need"),
        parameters: z
          .record(z.any())
          .optional()
          .describe("Optional parameters for the query"),
      }),
    });
  }

  /**
   * Get detailed analysis of the plugin
   */
  getPluginAnalysis() {
    return {
      entities: this.getEntityInfo(),
      schemas: this.getSchemas(),
      repoFunctions: Object.keys(this.getRepoFunctions()),
      capabilities: this.smartTool.getEntityInfo(),
    };
  }
}

/**
 * Example usage of the universal tool with any plugin
 */
export function createUniversalToolFromPlugin(plugin: Plugin) {
  const builder = new EnhancedURPCToolBuilder(plugin);

  // Get plugin analysis
  const analysis = builder.getPluginAnalysis();
  console.log("Plugin Analysis:", analysis);

  // Create a universal tool that can handle any query
  const universalTool = builder.createUniversalTool({
    id: "universal_query_tool",
    description: `Universal tool that can handle queries across all available entities: ${Object.keys(analysis.entities).join(", ")}`,
  });

  return {
    tool: universalTool,
    analysis,
    builder,
  };
}

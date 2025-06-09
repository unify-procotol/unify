#!/usr/bin/env node

import { program } from "commander";
import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { SourceConfig } from "unify-api";
import { FileStorage } from "unify-api";
import { BuiltinMethods } from "unify-api";

/**
 * CLI工具 - 用于预先初始化表结构和生成内置方法
 */
class UnifyServerCLI {
  private storage: FileStorage;
  private builtinMethods: BuiltinMethods;

  constructor(dataDir: string = "./data") {
    this.storage = new FileStorage(dataDir);
    this.builtinMethods = new BuiltinMethods(this.storage);
  }

  /**
   * 加载配置文件 - 支持JSON和TypeScript格式
   */
  private async loadConfig(configPath: string): Promise<SourceConfig> {
    const absolutePath = path.resolve(configPath);
    const ext = path.extname(configPath).toLowerCase();

    try {
      if (ext === ".json") {
        // JSON配置文件
        const configContent = fs.readFileSync(absolutePath, "utf-8");
        return JSON.parse(configContent);
      } else if (ext === ".ts" || ext === ".js") {
        // TypeScript/JavaScript配置文件
        return await this.loadTSConfig(absolutePath);
      } else {
        throw new Error(
          `Unsupported config file format: ${ext}. Supported formats: .json, .ts, .js`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to load config from ${configPath}: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * 加载TypeScript配置文件
   */
  private async loadTSConfig(absolutePath: string): Promise<SourceConfig> {
    try {
      // 检查是否是已编译的JS文件或者可以直接导入的文件
      let moduleToImport = absolutePath;

      // 如果是.ts文件，尝试查找对应的.js文件
      if (absolutePath.endsWith(".ts")) {
        const jsPath = absolutePath.replace(".ts", ".js");
        if (fs.existsSync(jsPath)) {
          moduleToImport = jsPath;
          console.log(`Using compiled JS file: ${jsPath}`);
        } else {
          // 检查是否在ES模块环境中
          const packageJsonPath = this.findNearestPackageJson(absolutePath);
          const isESModule =
            packageJsonPath && this.isESModulePackage(packageJsonPath);

          if (isESModule) {
            // 在ES模块环境中，使用Bun来执行TypeScript文件
            console.log(
              "Detected ES module environment, using Bun to evaluate TypeScript config"
            );
            const config = await this.loadConfigWithBun(absolutePath);
            return config;
          } else {
            // 传统的CommonJS环境 - 使用Bun作为fallback
            console.log("Using Bun to evaluate TypeScript config");
            const config = await this.loadConfigWithBun(absolutePath);
            return config;
          }
        }
      }

      // 动态导入模块 - 使用file:// URL以确保正确处理ES模块
      const fileUrl = `file://${moduleToImport}`;
      const configModule = await import(fileUrl);

      // 尝试从不同的导出方式获取配置
      let config: SourceConfig | undefined;

      // 方式1: 检查是否有导出的config对象
      if (configModule.config) {
        config = configModule.config;
      }
      // 方式2: 检查默认导出
      else if (
        configModule.default &&
        typeof configModule.default === "object"
      ) {
        // 如果默认导出有fetch属性，说明这是一个Bun/Node服务器配置
        // 我们需要从createSource调用中提取配置
        if (configModule.default.fetch) {
          throw new Error(
            "Cannot extract config from server export. " +
              "Please export the config object directly:\n" +
              'export const config = { id: "...", entities: {...} };'
          );
        } else {
          config = configModule.default;
        }
      }
      // 方式3: 检查命名导出
      else if (configModule.sourceConfig) {
        config = configModule.sourceConfig;
      } else {
        // 尝试查找任何看起来像配置的导出
        const exports = Object.keys(configModule);
        const configExport = exports.find(
          (key) =>
            key.toLowerCase().includes("config") ||
            key.toLowerCase().includes("source")
        );

        if (configExport) {
          config = configModule[configExport];
        }
      }

      if (!config) {
        throw new Error(
          "Could not find config object in TypeScript file. " +
            "Please export your config as one of:\n" +
            '- export const config = { id: "...", entities: {...} };\n' +
            '- export const sourceConfig = { id: "...", entities: {...} };\n' +
            '- export default { id: "...", entities: {...} };'
        );
      }

      // 验证配置格式
      if (!config.id || !config.entities) {
        throw new Error(
          'Invalid config format. Config must have "id" and "entities" properties.'
        );
      }

      return config;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to load TypeScript config: ${error}`);
    }
  }

  /**
   * 使用Bun加载TypeScript配置文件
   */
  private async loadConfigWithBun(tsPath: string): Promise<SourceConfig> {

    return new Promise((resolve, reject) => {
      // 创建一个临时脚本来加载和输出配置
      const tempScript = `
        import config from '${tsPath}';
        console.log(JSON.stringify(config));
      `;

      // 使用Bun执行脚本
      const bun = spawn("bun", ["--eval", tempScript], {
        stdio: "pipe",
        cwd: path.dirname(tsPath),
      });

      let stdout = "";
      let stderr = "";

      bun.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      bun.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      bun.on("close", (code: number) => {
        if (code === 0) {
          try {
            const config = JSON.parse(stdout.trim());
            resolve(config);
          } catch (parseError) {
            reject(new Error(`Failed to parse config output: ${parseError}`));
          }
        } else {
          reject(new Error(`Bun execution failed: ${stderr}`));
        }
      });

      bun.on("error", (error: Error) => {
        reject(new Error(`Failed to run Bun: ${error.message}`));
      });
    });
  }

  /**
   * 查找最近的package.json文件
   */
  private findNearestPackageJson(startPath: string): string | null {
    let currentDir = path.dirname(startPath);

    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        return packageJsonPath;
      }
      currentDir = path.dirname(currentDir);
    }

    return null;
  }

  /**
   * 检查package.json是否配置为ES模块
   */
  private isESModulePackage(packageJsonPath: string): boolean {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      return packageJson.type === "module";
    } catch {
      return false;
    }
  }

  /**
   * 从配置文件初始化所有表结构
   */
  async initTables(configPath: string): Promise<void> {
    try {
      const config = await this.loadConfig(configPath);

      console.log(`Initializing tables for source: ${config.id}`);

      Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
        console.log(`  Initializing table for entity: ${entityName}`);
        this.builtinMethods.initializeTable(
          config.id,
          entityName,
          entityConfig
        );
      });

      console.log("✅ All tables initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing tables:", error);
      process.exit(1);
    }
  }

  /**
   * 生成内置方法的代码文件
   */
  async generateMethods(
    configPath: string,
    outputPath?: string
  ): Promise<void> {
    try {
      const config = await this.loadConfig(configPath);

      console.log(`Generating builtin methods for source: ${config.id}`);

      const generatedMethods: Record<string, any> = {};

      Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
        console.log(`  Generating methods for entity: ${entityName}`);
        const methods = this.builtinMethods.generateBuiltinMethods(
          config.id,
          entityName,
          entityConfig
        );

        generatedMethods[entityName] = {
          sourceId: config.id,
          entityName,
          methods: Object.keys(methods),
          config: entityConfig,
        };
      });

      // 输出到文件
      const output = outputPath || `./generated/${config.id}-methods.json`;
      const outputDir = path.dirname(output);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(output, JSON.stringify(generatedMethods, null, 2));
      console.log(`✅ Methods generated and saved to: ${output}`);
    } catch (error) {
      console.error("❌ Error generating methods:", error);
      process.exit(1);
    }
  }

  /**
   * 生成TypeScript类型定义
   */
  async generateTypes(configPath: string, outputPath?: string): Promise<void> {
    try {
      const config = await this.loadConfig(configPath);

      console.log(`Generating TypeScript types for source: ${config.id}`);

      let typeDefinitions = `// Auto-generated types for ${config.id}\n\n`;

      Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
        if (entityConfig.table?.columns) {
          typeDefinitions += `export interface ${entityName} {\n`;

          Object.entries(entityConfig.table.columns).forEach(
            ([fieldName, fieldConfig]) => {
              const optional =
                fieldConfig.nullable || fieldConfig.default !== undefined
                  ? "?"
                  : "";
              const type = this.mapColumnTypeToTS(fieldConfig.type);
              typeDefinitions += `  ${fieldName}${optional}: ${type};\n`;
            }
          );

          typeDefinitions += `}\n\n`;
        }
      });

      // 输出到文件
      const output = outputPath || `./generated/${config.id}-types.ts`;
      const outputDir = path.dirname(output);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(output, typeDefinitions);
      console.log(`✅ Types generated and saved to: ${output}`);
    } catch (error) {
      console.error("❌ Error generating types:", error);
      process.exit(1);
    }
  }

  /**
   * 将数据库列类型映射为TypeScript类型
   */
  private mapColumnTypeToTS(columnType: string): string {
    const type = columnType.toLowerCase();

    if (
      type.includes("int") ||
      type.includes("decimal") ||
      type.includes("float")
    ) {
      return "number";
    }

    if (type.includes("bool")) {
      return "boolean";
    }

    if (type.includes("date") || type.includes("time")) {
      return "Date | string";
    }

    return "string";
  }

  /**
   * 验证配置文件格式
   */
  async validateConfig(configPath: string): Promise<void> {
    try {
      const config = await this.loadConfig(configPath);

      console.log(`Validating configuration: ${configPath}`);

      // 基本验证
      if (!config.id) {
        throw new Error("Missing required field: id");
      }

      if (!config.entities || Object.keys(config.entities).length === 0) {
        throw new Error("Missing or empty entities configuration");
      }

      // 验证每个实体
      Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
        console.log(`  Validating entity: ${entityName}`);

        if (entityConfig.table?.columns) {
          Object.entries(entityConfig.table.columns).forEach(
            ([fieldName, fieldConfig]) => {
              if (!fieldConfig.type) {
                throw new Error(
                  `Missing type for field ${entityName}.${fieldName}`
                );
              }
            }
          );
        }
      });

      console.log("✅ Configuration is valid");
    } catch (error) {
      console.error("❌ Configuration validation failed:", error);
      process.exit(1);
    }
  }
}

// 设置CLI命令
program
  .name("unify-api")
  .description("CLI tool for Unify Server")
  .version("1.0.0");

program
  .command("init-tables")
  .description("Initialize table structures from configuration")
  .argument("<config>", "Path to configuration file")
  .option("-d, --data-dir <dir>", "Data directory", "./data")
  .action(async (config: string, options: { dataDir: string }) => {
    const cli = new UnifyServerCLI(options.dataDir);
    await cli.initTables(config);
  });

program
  .command("generate-methods")
  .description("Generate builtin methods documentation")
  .argument("<config>", "Path to configuration file")
  .option("-o, --output <path>", "Output file path")
  .option("-d, --data-dir <dir>", "Data directory", "./data")
  .action(
    async (config: string, options: { output?: string; dataDir: string }) => {
      const cli = new UnifyServerCLI(options.dataDir);
      await cli.generateMethods(config, options.output);
    }
  );

program
  .command("generate-types")
  .description("Generate TypeScript type definitions")
  .argument("<config>", "Path to configuration file")
  .option("-o, --output <path>", "Output file path")
  .option("-d, --data-dir <dir>", "Data directory", "./data")
  .action(
    async (config: string, options: { output?: string; dataDir: string }) => {
      const cli = new UnifyServerCLI(options.dataDir);
      await cli.generateTypes(config, options.output);
    }
  );

program
  .command("validate-config")
  .description("Validate configuration file")
  .argument("<config>", "Path to configuration file")
  .action(async (config: string) => {
    const cli = new UnifyServerCLI();
    await cli.validateConfig(config);
  });

program
  .command("setup")
  .description("Complete setup: initialize tables, generate methods and types")
  .argument("<config>", "Path to configuration file")
  .option("-d, --data-dir <dir>", "Data directory", "./data")
  .option("--methods-output <path>", "Methods output file path")
  .option("--types-output <path>", "Types output file path")
  .action(
    async (
      config: string,
      options: { dataDir: string; methodsOutput?: string; typesOutput?: string }
    ) => {
      const cli = new UnifyServerCLI(options.dataDir);

      console.log("🚀 Starting complete setup...\n");

      await cli.validateConfig(config);
      console.log("");

      await cli.initTables(config);
      console.log("");

      await cli.generateMethods(config, options.methodsOutput);
      console.log("");

      await cli.generateTypes(config, options.typesOutput);
      console.log("");

      console.log("🎉 Setup completed successfully!");
    }
  );

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export { UnifyServerCLI };

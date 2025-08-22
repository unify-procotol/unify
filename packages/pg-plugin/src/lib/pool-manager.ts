import { Pool, PoolClient } from "pg";
import { PoolManagerConfig } from "../type";

export class PoolManager {
  private pool: Pool;
  private config: PoolManagerConfig;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: PoolManagerConfig) {
    this.config = {
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      acquireTimeoutMillis: 10000,
      healthCheckInterval: 60000,
      maxRetries: 3,
      retryDelay: 1000,
      enableMonitoring: true,
      logLevel: "info",
      ...config,
    };

    this.pool = new Pool(this.config);
    this.setupEventHandlers();
    this.startHealthCheck();
  }

  private setupEventHandlers(): void {
    this.pool.on("connect", (client: PoolClient) => {
      this.log("debug", `PostgreSQL client connected`);
    });
    this.pool.on("error", (err: Error, client: PoolClient) => {
      this.log("error", `PostgreSQL pool error: ${err.message}`);
    });
  }

  private startHealthCheck(): void {
    if (!this.config.enableMonitoring || !this.config.healthCheckInterval) {
      return;
    }

    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.healthCheck();
        this.log("debug", "Health check passed");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        this.log("error", `Health check failed: ${errorMessage}`);
      }
    }, this.config.healthCheckInterval);
  }

  async healthCheck(): Promise<boolean> {
    const client = await this.getClient();
    try {
      const result = await client.query("SELECT 1 as health_check");
      return result.rows[0].health_check === 1;
    } finally {
      client.release();
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async query<T = any>(
    text: string,
    params?: any[]
  ): Promise<{ rows: T[]; rowCount: number }> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
      };
    } catch (error) {
      this.log(
        "error",
        `Error querying database: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    } finally {
      client.release();
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  private log(level: string, message: string): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [PoolManager] ${message}`;

    switch (level) {
      case "error":
        console.error(logMessage);
        break;
      case "warn":
        console.warn(logMessage);
        break;
      case "debug":
        if (this.config.logLevel === "debug") {
          console.debug(logMessage);
        }
        break;
      default:
        console.log(logMessage);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ["debug", "info", "warn", "error"];
    const configLevel = levels.indexOf(this.config.logLevel || "info");
    const messageLevel = levels.indexOf(level);
    return messageLevel >= configLevel;
  }

  async close(): Promise<void> {
    this.log("info", "Closing PostgreSQL connection pool...");

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    try {
      await this.pool.end();
      this.log("info", "PostgreSQL connection pool closed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.log("error", `Error closing pool: ${errorMessage}`);
      throw error;
    }
  }

  async gracefulShutdown(timeoutMs: number = 10000): Promise<void> {
    this.log("info", "Initiating graceful shutdown...");

    const startTime = Date.now();

    while (
      this.pool.totalCount > this.pool.idleCount &&
      Date.now() - startTime < timeoutMs
    ) {
      this.log(
        "info",
        `Waiting for ${
          this.pool.totalCount - this.pool.idleCount
        } active connections to close...`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (this.pool.totalCount > this.pool.idleCount) {
      this.log(
        "warn",
        `Force closing ${
          this.pool.totalCount - this.pool.idleCount
        } active connections after timeout`
      );
    }

    await this.close();
  }
}

class GlobalPoolManager {
  private static instance: PoolManager | null = null;

  static initialize(config: PoolManagerConfig): PoolManager {
    if (this.instance && !config.forceInit) {
      console.error(
        "PoolManager already initialized. Use getInstance() instead."
      );
      return this.instance;
    }

    this.instance = new PoolManager(config);
    return this.instance;
  }

  static getInstance(): PoolManager {
    if (!this.instance) {
      throw new Error("PoolManager not initialized. Call initialize() first.");
    }
    return this.instance;
  }

  static async shutdown(): Promise<void> {
    if (this.instance) {
      await this.instance.gracefulShutdown();
      this.instance = null;
    }
  }
}

export { GlobalPoolManager };

import { Pool, PoolClient } from "pg";
import { PoolManagerConfig } from "../type";

export class PoolManager {
  private pool: Pool;
  private config: PoolManagerConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private stats = {
    totalConnections: 0,
    activeConnections: 0,
    totalQueries: 0,
    totalErrors: 0,
    lastHealthCheck: new Date(),
    errors: [] as { timestamp: Date; error: string; context?: string }[],
  };

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
      this.stats.totalConnections++;
      this.log(
        "debug",
        `PostgreSQL client connected. Total: ${this.stats.totalConnections}`
      );
    });

    // Connection acquisition event
    this.pool.on("acquire", (client: PoolClient) => {
      this.stats.activeConnections++;
      this.log(
        "debug",
        `Client acquired. Active: ${this.stats.activeConnections}`
      );
    });

    // Connection removal event
    this.pool.on("remove", (client: PoolClient) => {
      this.stats.totalConnections = Math.max(
        0,
        this.stats.totalConnections - 1
      );
      this.stats.activeConnections = Math.max(
        0,
        this.stats.activeConnections - 1
      );
      this.log(
        "debug",
        `Client removed. Total: ${this.stats.totalConnections}`
      );
    });

    this.pool.on("error", (err: Error, client: PoolClient) => {
      this.stats.totalErrors++;
      this.recordError(err.message, "pool");
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
        this.stats.lastHealthCheck = new Date();
        this.log("debug", "Health check passed");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        this.recordError(errorMessage, "health_check");
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
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error) {
      this.stats.totalErrors++;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.recordError(errorMessage, "get_client");
      throw error;
    }
  }

  async query<T = any>(
    text: string,
    params?: any[]
  ): Promise<{ rows: T[]; rowCount: number }> {
    const client = await this.getClient();
    try {
      this.stats.totalQueries++;
      const result = await client.query(text, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
      };
    } catch (error) {
      this.stats.totalErrors++;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.recordError(errorMessage, "query");
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
      this.stats.totalErrors++;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.recordError(errorMessage, "transaction");
      throw error;
    } finally {
      client.release();
    }
  }

  getStats() {
    return {
      ...this.stats,
      poolStats: {
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount,
        activeCount:
          this.pool.totalCount - this.pool.idleCount - this.pool.waitingCount,
      },
    };
  }

  private recordError(message: string, context?: string): void {
    this.stats.errors.push({
      timestamp: new Date(),
      error: message,
      context,
    });

    // Keep only the latest 100 error records
    if (this.stats.errors.length > 100) {
      this.stats.errors = this.stats.errors.slice(-100);
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
  private static config: PoolManagerConfig | null = null;

  static initialize(config: PoolManagerConfig): PoolManager {
    if (this.instance) {
      console.error(
        "PoolManager already initialized. Use getInstance() instead."
      );
      return this.instance;
    }

    this.config = config;
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
      this.config = null;
    }
  }
}

export { GlobalPoolManager };

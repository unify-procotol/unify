import { Pool, PoolClient, PoolConfig } from "pg";

export interface PoolManagerConfig extends PoolConfig {
  // Basic connection configuration
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;

  // Connection pool configuration
  max?: number; // Maximum number of connections, default 20
  min?: number; // Minimum number of connections, default 2
  idleTimeoutMillis?: number; // Idle connection timeout, default 30000ms
  connectionTimeoutMillis?: number; // Connection timeout, default 10000ms
  acquireTimeoutMillis?: number; // Connection acquisition timeout, default 10000ms

  // Health check configuration
  healthCheckInterval?: number; // Health check interval, default 60000ms
  maxRetries?: number; // Maximum retry count, default 3
  retryDelay?: number; // Retry delay, default 1000ms

  // Monitoring configuration
  enableMonitoring?: boolean; // Whether to enable monitoring, default true
  logLevel?: "debug" | "info" | "warn" | "error";
}

export interface EntityConfig {
  [key: string]: {
    schema: string;
    table: string;
  };
}

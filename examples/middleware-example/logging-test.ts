import { Repository } from "@unilab/core";
import type { DataSourceAdapter } from "@unilab/core";
import { Logging } from "@unilab/core/middleware";

// 定义用户实体类型
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

// 创建一个简单的内存数据源适配器用于测试
class InMemoryUserAdapter implements DataSourceAdapter<User> {
  private users: User[] = [
    { id: 1, name: "Alice", email: "alice@example.com", age: 25 },
    { id: 2, name: "Bob", email: "bob@example.com", age: 30 },
    { id: 3, name: "Charlie", email: "charlie@example.com", age: 35 },
  ];
  private nextId = 4;

  async findMany(args?: any): Promise<User[]> {
    console.log("InMemoryUserAdapter: Executing findMany operation");
    let result = [...this.users];

    if (args?.where) {
      const { where } = args;
      result = result.filter((user) => {
        return Object.entries(where).every(([key, value]) => {
          return user[key as keyof User] === value;
        });
      });
    }

    if (args?.limit) {
      result = result.slice(0, args.limit);
    }

    return result;
  }

  async findOne(args: any): Promise<User | null> {
    console.log("InMemoryUserAdapter: Executing findOne operation");
    const { where } = args;
    const user = this.users.find((u) => {
      return Object.entries(where).every(([key, value]) => {
        return u[key as keyof User] === value;
      });
    });
    return user || null;
  }

  async create(args: any): Promise<User> {
    console.log("InMemoryUserAdapter: Executing create operation");
    const newUser: User = {
      id: this.nextId++,
      ...args.data,
    };
    this.users.push(newUser);
    return newUser;
  }

  async update(args: any): Promise<User> {
    console.log("InMemoryUserAdapter: Executing update operation");
    const { where, data } = args;
    const userIndex = this.users.findIndex((u) => {
      return Object.entries(where).every(([key, value]) => {
        return u[key as keyof User] === value;
      });
    });

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    this.users[userIndex] = { ...this.users[userIndex], ...data };
    return this.users[userIndex];
  }

  async delete(args: any): Promise<boolean> {
    console.log("InMemoryUserAdapter: Executing delete operation");
    const { where } = args;
    const userIndex = this.users.findIndex((u) => {
      return Object.entries(where).every(([key, value]) => {
        return u[key as keyof User] === value;
      });
    });

    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    return true;
  }
}

// 自定义日志记录器
class CustomLogger {
  private logs: string[] = [];

  log(message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;

    if (context) {
      console.log(logEntry, context);
      this.logs.push(`${logEntry} ${JSON.stringify(context)}`);
    } else {
      console.log(logEntry);
      this.logs.push(logEntry);
    }
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

// 测试函数
async function testLoggingMiddleware() {
  console.log("=== Logging Middleware Test Started ===\n");

  // 创建自定义日志器
  const customLogger = new CustomLogger();

  // 创建 Repository 实例
  const userRepository = new Repository<User>(new InMemoryUserAdapter());

  // 使用默认的 console.log 日志中间件
  const defaultLoggingMiddleware = Logging<User>();
  userRepository.use(defaultLoggingMiddleware, {
    name: "defaultLogger",
    priority: 1,
  });

  // 使用自定义日志器的中间件
  const customLoggingMiddleware = Logging<User>((message, context) =>
    customLogger.log(`CUSTOM: ${message}`, context)
  );
  userRepository.use(customLoggingMiddleware, {
    name: "customLogger",
    priority: 2,
  });

  console.log("1. Testing findMany operation:");
  console.log("-------------------------------");
  const allUsers = await userRepository.findMany();
  console.log("Result:", allUsers);

  console.log("\n2. Testing findMany with limit:");
  console.log("--------------------------------");
  const limitedUsers = await userRepository.findMany({ limit: 2 });
  console.log("Result:", limitedUsers);

  console.log("\n3. Testing findOne operation:");
  console.log("------------------------------");
  const user = await userRepository.findOne({ where: { id: 1 } });
  console.log("Result:", user);

  console.log("\n4. Testing create operation:");
  console.log("-----------------------------");
  try {
    const newUser = await userRepository.create({
      data: { name: "David", email: "david@example.com", age: 28 },
    });
    console.log("Result:", newUser);
  } catch (error) {
    console.error("Create failed:", error);
  }

  console.log("\n5. Testing update operation:");
  console.log("-----------------------------");
  try {
    const updatedUser = await userRepository.update({
      where: { id: 2 },
      data: { age: 31 },
    });
    console.log("Result:", updatedUser);
  } catch (error) {
    console.error("Update failed:", error);
  }

  console.log("\n6. Testing delete operation:");
  console.log("-----------------------------");
  try {
    const deleteResult = await userRepository.delete({ where: { id: 3 } });
    console.log("Delete result:", deleteResult);
  } catch (error) {
    console.error("Delete failed:", error);
  }

  console.log("\n7. Testing error handling:");
  console.log("---------------------------");
  try {
    await userRepository.findOne({ where: { id: 999 } });
  } catch (error) {
    console.error("Expected error handled by logging middleware");
  }

  // 显示自定义日志器记录的所有日志
  console.log("\n8. Custom logger captured logs:");
  console.log("--------------------------------");
  const capturedLogs = customLogger.getLogs();
  capturedLogs.forEach((log, index) => {
    console.log(`${index + 1}. ${log}`);
  });

  console.log("\n=== Logging Middleware Test Completed ===");
}

// 运行测试
if (import.meta.main) {
  testLoggingMiddleware().catch(console.error);
}

export { testLoggingMiddleware };

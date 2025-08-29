import { AST, Parser } from "node-sql-parser";

const checkForWriteOperations = (ast: any): string | null => {
  if (!ast) return null;

  // Check current node type for write operations
  if (
    ast.type &&
    [
      "insert",
      "update",
      "delete",
      "create",
      "drop",
      "alter",
      "truncate",
    ].includes(ast.type.toLowerCase())
  ) {
    return `Write operation '${ast.type.toUpperCase()}' is not allowed`;
  }

  // Recursively check CTEs (Common Table Expressions)
  if (ast.with && Array.isArray(ast.with)) {
    for (const cte of ast.with) {
      if (cte.stmt) {
        const error = checkForWriteOperations(cte.stmt);
        if (error) return error;
      }
    }
  }

  // Recursively check subqueries in FROM clause
  if (ast.from && Array.isArray(ast.from)) {
    for (const fromItem of ast.from) {
      if (fromItem.expr) {
        const error = checkForWriteOperations(fromItem.expr);
        if (error) return error;
      }
    }
  }

  // Recursively check subqueries in WHERE clause
  if (ast.where) {
    const error = checkForWriteOperations(ast.where);
    if (error) return error;
  }

  // Recursively check subqueries in SELECT columns
  if (ast.columns && Array.isArray(ast.columns)) {
    for (const column of ast.columns) {
      if (column.expr) {
        const error = checkForWriteOperations(column.expr);
        if (error) return error;
      }
    }
  }

  // Check nested expressions
  if (ast.left) {
    const error = checkForWriteOperations(ast.left);
    if (error) return error;
  }

  if (ast.right) {
    const error = checkForWriteOperations(ast.right);
    if (error) return error;
  }

  // Check array of expressions
  if (ast.expr && Array.isArray(ast.expr)) {
    for (const expr of ast.expr) {
      const error = checkForWriteOperations(expr);
      if (error) return error;
    }
  }

  return null;
};

export const checkSQL = (sqlStatement: string): string | null => {
  if (!sqlStatement) {
    return "SQL statement is empty";
  }

  const parser = new Parser();
  let ast: AST | AST[];
  try {
    ast = parser.astify(sqlStatement, {
      database: "Postgresql",
    });
  } catch (error) {
    return `Invalid SQL statement\n ${
      error instanceof Error ? error.message : String(error)
    }`;
  }

  if (Array.isArray(ast)) {
    if (ast.length > 1) {
      return "Only allow one statement";
    }
    ast = ast[0];
  }

  if (ast.type !== "select") {
    return "Only allow select statement";
  }

  // Check for SELECT INTO which is a write operation
  // @ts-ignore
  if (ast.into?.position) {
    return "'INTO' is not allowed";
  }

  if (ast.from === null) {
    return "The syntax of from is not supported";
  }

  // Check for write operations recursively throughout the AST
  const writeOperationError = checkForWriteOperations(ast);
  if (writeOperationError) {
    return writeOperationError;
  }

  return null;
};

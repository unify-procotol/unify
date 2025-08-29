import {
  BaseAdapter,
  ErrorCodes,
  OperationContext,
  URPCError,
} from "@unilab/urpc-core";
import { DatabaseTable, getAllTables } from "../lib/generate-entities";
import { GlobalPoolManager } from "../lib/pool-manager";
import { checkSQL } from "../lib/sql-parser";

export class PgBuiltinAdapter extends BaseAdapter<any> {
  static displayName = "PgBuiltinAdapter";

  async tables(args: any, ctx?: OperationContext): Promise<DatabaseTable[]> {
    const poolManager = GlobalPoolManager.getInstance();
    return getAllTables(poolManager);
  }

  async query(
    args: {
      queryText: string;
      values?: any[];
    },
    ctx?: OperationContext
  ): Promise<{
    rows: any[];
    rowCount: number;
  }> {
    const error = checkSQL(args.queryText);
    if (error) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, error);
    }
    const poolManager = GlobalPoolManager.getInstance();
    return poolManager.query(args.queryText, args.values);
  }
}

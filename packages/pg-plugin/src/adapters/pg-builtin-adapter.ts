import { BaseAdapter, OperationContext } from "@unilab/urpc-core";
import { DatabaseTable, getAllTables } from "../lib/generate-entities";
import { GlobalPoolManager } from "../lib/pool-manager";

export class PgBuiltinAdapter extends BaseAdapter<any> {
  static displayName = "PgBuiltinAdapter";

  async tables(args: any, ctx?: OperationContext): Promise<DatabaseTable[]> {
    const poolManager = GlobalPoolManager.getInstance();
    return getAllTables(poolManager);
  }

  async query(
    args: {
      queryText: string;
      values: any[];
    },
    ctx?: OperationContext
  ): Promise<any> {
    const poolManager = GlobalPoolManager.getInstance();
    return poolManager.query(args.queryText, args.values);
  }
}

import {
  BaseAdapter,
  CallArgs,
  EntityConfigs,
  ErrorCodes,
  SchemaObject,
  URPCError,
} from "@unilab/urpc-core";
import { ChatEntity } from "../entities";
import { repo, URPC } from "@unilab/urpc";
import { executeURPCCode } from "../utils";

export class MastraClientAdapter extends BaseAdapter<ChatEntity> {
  static readonly displayName = "MastraClientAdapter";
  hasEntityInfo: boolean = false;
  entitySchemas: Record<string, SchemaObject> = {};
  entitySources: Record<string, string[]> = {};
  entityConfigs: EntityConfigs = {};
  isProxyConfigured: boolean = false;

  private getEntityInfo() {
    if (!this.hasEntityInfo) {
      const entitySchemas = URPC.getEntitySchemas();
      const entitySources = URPC.getEntitySources();
      const entityConfigs = URPC.getEntityConfigs();

      this.entitySchemas = Object.fromEntries(
        Object.entries(entitySchemas).filter(([key]) => key !== "ChatEntity")
      );
      this.entitySources = Object.fromEntries(
        Object.entries(entitySources).filter(
          ([key]) => key !== "ChatEntity" && key !== "SchemaEntity"
        )
      );
      this.entityConfigs = entityConfigs;
      this.hasEntityInfo = true;
    }

    return {
      entitySchemas: this.entitySchemas,
      entitySources: this.entitySources,
      entityConfigs: this.entityConfigs,
    };
  }

  async call(args: CallArgs<ChatEntity>): Promise<ChatEntity | Response> {
    const { input, model } = args;
    if (!input) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "input is required");
    }

    const { entitySchemas, entitySources, entityConfigs } =
      this.getEntityInfo();

    const result = await repo({
      entity: "chat",
      source: "mastra",
    }).call({
      input,
      model,
      proxy: true,
      entitySchemas,
      entitySources,
      entityConfigs,
    });

    if (result instanceof Response) {
      return result;
    }

    const output = result.output;
    const urpcCode = output.urpc_code;
    if (!urpcCode) {
      return {
        input,
        output,
      };
    }
    const operationResult = await executeURPCCode(urpcCode);
    return {
      input,
      output: {
        ...output,
        ...operationResult,
      },
    };
  }
}

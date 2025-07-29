import {
  BaseAdapter,
  ErrorCodes,
  simplifyEntityName,
  URPCError,
} from "@unilab/urpc-core";
import { ChatEntity } from "../entities";
import { repo, URPC } from "@unilab/urpc";
import { executeExecutionPlan } from "../utils";

export class MastraClientAdapter extends BaseAdapter<ChatEntity> {
  static readonly displayName = "MastraClientAdapter";

  private getEntityInfo(entities: string[] = []) {
    const _entitySchemas = URPC.getEntitySchemas();
    const _entitySources = URPC.getEntitySources();
    const _entityConfigs = URPC.getEntityConfigs();
    const entitySchemas = Object.fromEntries(
      Object.entries(_entitySchemas).filter(
        ([key]) => key !== "ChatEntity" && entities.includes(key)
      )
    );
    const entitySources = Object.fromEntries(
      Object.entries(_entitySources).filter(
        ([key]) =>
          key !== "ChatEntity" &&
          key !== "SchemaEntity" &&
          entities.includes(key)
      )
    );
    const _entities = entities.map((entity) => simplifyEntityName(entity));
    const entityConfigs = Object.fromEntries(
      Object.entries(_entityConfigs).filter(([key]) => {
        return _entities.includes(key);
      })
    );
    return {
      entitySchemas,
      entitySources,
      entityConfigs,
    };
  }

  async call(args: Partial<ChatEntity>): Promise<ChatEntity> {
    const { input, model, agent: agentName, entities } = args;
    if (!input) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "input is required");
    }

    const { entitySchemas, entitySources, entityConfigs } =
      this.getEntityInfo(entities);

    const result = await repo({
      entity: "chat",
      source: "mastra",
    }).call({
      input,
      model,
      proxy: true,
      entities,
      entitySchemas,
      entitySources,
      entityConfigs,
      agent: agentName,
    });

    const output = result.output;

    if (output.execution_plan) {
      const planOutput = await executeExecutionPlan(output.execution_plan);
      return {
        input,
        output: planOutput,
      };
    }

    return {
      input,
      output,
    };
  }
}

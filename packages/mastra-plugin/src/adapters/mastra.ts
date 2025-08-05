import {
  BaseAdapter,
  ErrorCodes,
  OperationContext,
  URPCError,
} from "@unilab/urpc-core";
import { ChatEntity } from "../entities/chat";
import { AgentInterface, MastraPluginOptions } from "../type";

export class MastraAdapter extends BaseAdapter<ChatEntity> {
  static displayName = "MastraAdapter";
  private agentInstances: Map<string, AgentInterface>;
  private defaultAgent: string;

  constructor(options: MastraPluginOptions) {
    super();
    this.agentInstances = new Map(Object.entries(options.agents));
    this.defaultAgent = options.defaultAgent || "l1";
  }

  private getAgent(agentName?: string): AgentInterface {
    const targetAgentName = agentName || this.defaultAgent;
    const agentInstance = this.agentInstances.get(targetAgentName);
    if (!agentInstance) {
      throw new URPCError(
        ErrorCodes.BAD_REQUEST,
        `Agent "${targetAgentName}" not found. Available agents: ${
          this.options.agents
            ? Object.keys(this.options.agents).join(", ")
            : "none"
        }`
      );
    }
    return agentInstance;
  }

  async call(
    args: Partial<ChatEntity>,
    ctx: OperationContext
  ): Promise<ChatEntity | Response> {
    const {
      input,
      model,
      proxy,
      entities,
      entitySchemas,
      entitySources,
      entityConfigs,
      agent: agentName,
    } = args;

    if (!input) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "input is required");
    }

    const agent = this.getAgent(agentName);

    if (!agent.streamResponse) {
      throw new URPCError(
        ErrorCodes.BAD_REQUEST,
        "Agent does not support stream response"
      );
    }

    if (!ctx.stream) {
      if (proxy) {
        if (
          agent.setProxyConfig &&
          entitySchemas &&
          entitySources &&
          entityConfigs
        ) {
          agent.setProxyConfig({
            entitySchemas,
            entitySources,
            entityConfigs,
          });
        }
      }

      const output = await agent.processRequest({
        input,
        model,
        proxy,
        entities,
      });

      return {
        input,
        output,
      };
    } else {
      if (ctx.honoCtx) {
        const { stream } = await import("hono/streaming");
        return stream(ctx.honoCtx, async (stream) => {
          const readableStream: ReadableStream<any> =
            await agent.streamResponse?.({
              input,
              model,
              proxy,
              entities,
            });
          const reader = readableStream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await stream.write(value);
          }
          await stream.close();
        });
      }

      throw new URPCError(ErrorCodes.BAD_REQUEST, "stream is not supported");
    }
  }
}

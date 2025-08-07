import {
  BaseAdapter,
  ErrorCodes,
  OperationContext,
  URPCError,
} from "@unilab/urpc-core";
import { ChatEntity } from "../entities/chat";
import { MastraPluginOptions, URPCAgentRuntimeContext } from "../type";
import { Mastra } from "@mastra/core";
import { RuntimeContext } from "@mastra/core/runtime-context";
import {
  getEntityInfo,
  processRequest,
  streamResponse,
} from "../agents/mastra";

export class MastraAdapter extends BaseAdapter<ChatEntity> {
  static displayName = "MastraAdapter";
  private mastraInstance: Mastra;
  private runtimeContext: RuntimeContext;

  constructor(options: MastraPluginOptions) {
    super();
    this.mastraInstance = options.mastraInstance;
    this.runtimeContext = new RuntimeContext<URPCAgentRuntimeContext>();
  }

  private getAgent(agentName?: string) {
    const targetAgentName = agentName || this.defaultAgent || "urpcSimpleAgent";

    try {
      const agent = this.mastraInstance.getAgent(targetAgentName);
      if (!agent) {
        throw new URPCError(
          ErrorCodes.BAD_REQUEST,
          `Agent "${targetAgentName}" not found.`
        );
      }
      return agent;
    } catch (error) {
      throw new URPCError(
        ErrorCodes.BAD_REQUEST,
        `Agent "${targetAgentName}" not found.`
      );
    }
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

    if (!ctx.stream) {
      if (proxy) {
        if (entitySchemas && entitySources && entityConfigs) {
          this.runtimeContext.set("entity-schemas", entitySchemas);
          this.runtimeContext.set("entity-sources", entitySources);
          this.runtimeContext.set("entity-configs", entityConfigs);
        }
      } else {
        const entityInfo = getEntityInfo(entities);
        this.runtimeContext.set("entity-schemas", entityInfo.entitySchemas);
        this.runtimeContext.set("entity-sources", entityInfo.entitySources);
        this.runtimeContext.set("entity-configs", entityInfo.entityConfigs);
      }

      if (model) {
        this.runtimeContext.set("model", model);
      }

      const output = await processRequest({
        input,
        proxy,
        agent,
        runtimeContext: this.runtimeContext,
        mastraInstance: this.mastraInstance,
        summary: ctx.summary,
      });

      return {
        input,
        output,
      };
    } else {
      if (ctx.honoCtx) {
        const { stream } = await import("hono/streaming");
        return stream(ctx.honoCtx, async (stream) => {
          const readableStream: ReadableStream<any> = await streamResponse({
            input,
            proxy,
            agent,
            runtimeContext: this.runtimeContext,
            mastraInstance: this.mastraInstance,
            summary: ctx.summary,
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

      if (ctx.nextRequest) {
        const readableStream: ReadableStream<any> = await streamResponse({
          input,
          proxy,
          agent,
          runtimeContext: this.runtimeContext,
          mastraInstance: this.mastraInstance,
          summary: ctx.summary,
        });
        return new Response(readableStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      throw new URPCError(ErrorCodes.BAD_REQUEST, "stream is not supported");
    }
  }
}

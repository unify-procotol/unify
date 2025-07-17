import {
  BaseAdapter,
  CallArgs,
  ErrorCodes,
  PageRouterStreamResponse,
  URPCError,
} from "@unilab/urpc-core";
import { ChatEntity } from "../entities/chat";
import { MastraOptions, URPC } from "../utils/type";
import { URPCAgent } from "../utils/urpc-agent";

export class MastraAdapter extends BaseAdapter<ChatEntity> {
  static displayName = "MastraAdapter";

  private options: MastraOptions & { URPC: URPC };
  private agentInstance: URPCAgent | null = null;

  constructor(options: MastraOptions & { URPC: URPC }) {
    super();
    this.options = options;
  }

  async call(
    args: CallArgs<ChatEntity>,
    ctx?: {
      honoCtx?: any;
      nextRequest?: any;
      nextApiRequest?: any;
      stream?: boolean;
    }
  ): Promise<ChatEntity | Response | PageRouterStreamResponse> {
    const { input, model, proxy, entitySchemas, entitySources, entityConfigs } =
      args;

    if (!input) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "input is required");
    }

    let agentInstance = this.agentInstance;
    if (!agentInstance) {
      agentInstance = new URPCAgent(this.options);
      this.agentInstance = agentInstance;
    }

    if (proxy && entitySchemas && entitySources && entityConfigs) {
      agentInstance.setProxyConfig({
        entitySchemas,
        entitySources,
        entityConfigs,
      });
    }

    const { honoCtx, nextRequest, nextApiRequest, stream } = ctx || {};

    if (stream) {
      if (honoCtx) {
        const { stream } = await import("hono/streaming");
        return stream(honoCtx, async (stream) => {
          const readableStream: ReadableStream<any> =
            await agentInstance.streamResponse({
              input,
              model,
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

      if (nextRequest) {
        const stream = new ReadableStream({
          async start(controller) {
            const readableStream: ReadableStream<any> =
              await agentInstance.streamResponse({
                input,
                model,
              });
            const reader = readableStream.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
            controller.close();
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "Transfer-Encoding": "chunked",
          },
        });
      }

      if (nextApiRequest) {
        return {
          __isPageRouterStream: true,
          streamHandler: async (res: any) => {
            // Set appropriate headers for streaming
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            try {
              const readableStream: ReadableStream<any> =
                await agentInstance.streamResponse({
                  input,
                  model,
                });
              const reader = readableStream.getReader();
              const decoder = new TextDecoder();

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode and write the chunk
                const chunk = decoder.decode(value, { stream: true });
                res.write(chunk);
              }
            } catch (error) {
              console.error("Streaming error:", error);
              res.write("Error occurred during streaming");
            } finally {
              res.end();
            }
          },
        } as PageRouterStreamResponse;
      }
    }

    const output = await agentInstance.processRequest({
      input,
      model,
      proxy,
    });
    return {
      input,
      output,
    };
  }
}

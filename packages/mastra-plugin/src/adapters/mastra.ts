import { BaseAdapter, ErrorCodes, URPCError } from "@unilab/urpc-core";
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

  async call(args: Partial<ChatEntity>): Promise<ChatEntity> {
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

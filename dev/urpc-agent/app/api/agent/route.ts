import { NextRequest, NextResponse } from "next/server";
import { URPCAgent } from "@/core/agent";

let agentInstance: URPCAgent;

function getAgent(): URPCAgent {
  if (!agentInstance) {
    agentInstance = new URPCAgent();
  }
  return agentInstance;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "请提供有效的消息内容" },
        { status: 400 }
      );
    }

    const agent = getAgent();
    const response = await agent.processRequest(message);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Agent API错误:", error);
    return NextResponse.json(
      {
        success: false,
        operation: "error",
        entity: "unknown",
        data: null,
        message: `处理请求时发生错误: ${error.message}`,
        urpc_code: null,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      name: "URPC Agent API",
      description: "URPC智能数据操作助手API",
      version: "1.0.0",
      endpoints: {
        POST: "/api/agent - 发送消息给Agent",
      },
      status: "active",
    },
    { status: 200 }
  );
}

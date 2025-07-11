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
        { error: "Please provide a valid message content" },
        { status: 400 }
      );
    }

    const agent = getAgent();
    const response = await agent.processRequest(message);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      {
        success: false,
        operation: "error",
        entity: "unknown",
        data: null,
        message: `An error occurred while processing the request: ${error.message}`,
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
      description: "URPC intelligent data operation assistant API",
      version: "1.0.0",
      endpoints: {
        POST: "/api/agent - Send message to Agent",
      },
      status: "active",
    },
    { status: 200 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { URPCAgent } from "@unilab/urpc-ai";
import { repo, URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { UserEntity } from "@/entities/user";
import { PostEntity } from "@/entities/post";
import { MemoryAdapter } from "@unilab/urpc-adapters";

let agentInstance: URPCAgent;

function getAgent(): URPCAgent {
  if (!agentInstance) {
    // Initialize URPC
    initURPC();

    // new URPC Agent instance
    agentInstance = new URPCAgent({
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      model: "openai/gpt-4o-mini",
      // debug: true,
    });
  }
  return agentInstance;
}

function initURPC() {
  // Define plugin configuration
  const DataPlugin: Plugin = {
    entities: [UserEntity, PostEntity],
  };

  // Initialize URPC client
  URPC.init({
    plugins: [DataPlugin],
    entityConfigs: {
      user: {
        defaultSource: "memory",
      },
      post: {
        defaultSource: "memory",
      },
    },
    globalAdapters: [MemoryAdapter],
  });

  // Initialize data
  repo({
    entity: "user",
    source: "memory",
  }).create({
    data: {
      id: "1",
      name: "John",
      email: "john@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
  });

  repo({
    entity: "post",
    source: "memory",
  }).create({
    data: {
      id: "1",
      title: "Welcome to URPC Agent",
      content:
        "This is the first sample article, demonstrating the basic functionality of URPC Agent.",
      userId: "1",
    },
  });
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

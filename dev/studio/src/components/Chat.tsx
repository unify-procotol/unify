import { useState, useRef, useEffect } from "react";
import { repo } from "@unilab/urpc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import {
  Send,
  Bot,
  User,
  Loader2,
  X,
  MessageCircle,
  Code,
  AlertTriangle,
  Database,
  ChevronDown,
} from "lucide-react";
import { cn } from "../lib/utils";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  data?: any;
  urpcCode?: string;
  entity?: string;
  operation?: string;
  success?: boolean;
}

interface ChatProps {
  className?: string;
  isEmbedded?: boolean;
  onClose?: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  isActive?: boolean;
}

interface PostData {
  id: string;
  name?: string;
  title?: string;
  content?: string;
  userId?: string;
  email?: string;
  role?: string;
  type?: string;
  category?: string;
  status?: string;
  createdAt?: string;
  imageUrl?: string;
}

// Check if error is related to missing chat/mastra configuration
function isChatConfigError(error: Error): boolean {
  const errorMsg = error.message.toLowerCase();
  return (
    (errorMsg.includes("chat") &&
      (errorMsg.includes("not found") ||
        errorMsg.includes("404") ||
        errorMsg.includes("entity") ||
        errorMsg.includes("source") ||
        errorMsg.includes("mastra"))) ||
    errorMsg.includes("fetch failed") ||
    errorMsg.includes("network error")
  );
}

// Configuration code snippet for server setup
const SERVER_CONFIG_CODE = `// Add MastraPlugin to your server.ts
import { URPC } from "@unilab/urpc-hono";
import { MastraPlugin } from "@unilab/mastra-plugin/hono";
import { MockAdapter } from "@unilab/urpc-adapters";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
app.use(cors());

URPC.init({
  app,
  plugins: [
    // Add MastraPlugin for AI chat functionality
    MastraPlugin({
      defaultModel: "openai/gpt-4o-mini", // or "google/gemini-2.0-flash-001"
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      debug: true,
    }),
  ],
  entityConfigs: {
    user: {
      defaultSource: "mock",
    },
    // Enable chat entity
    chat: {
      defaultSource: "mastra",
    },
  },
  globalAdapters: [
    {
      source: "mock",
      factory: () => new MockAdapter(),
    }
  ],
});`;

export function Chat({ className, isEmbedded = false, onClose }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello! I'm your AI assistant. I can help you query and analyze data. Try commands like 'Find all users' or 'Find all posts'.",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfigHelper, setShowConfigHelper] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [postData, setPostData] = useState<PostData[]>([]);
  const [selectedModel, setSelectedModel] = useState(
    "google/gemini-2.0-flash-001"
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available models
  const availableModels = [
    { value: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
    { value: "openai/gpt-4o", label: "GPT-4o" },
    { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  ];

  // Quick commands
  const quickCommands = [
    "Find all users",
    "Find all posts",
    "Create a new user named Alice with email alice@example.com",
    "Update user with id 1",
  ];

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && !isEmbedded) {
      inputRef.current.focus();
    }
  }, [isEmbedded]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    setShowConfigHelper(false);

    try {
      // Use ChatEntity from mastra plugin
      const result = await repo({
        entity: "chat",
        source: "mastra",
      }).call({
        input: textToSend,
        model:
          selectedModel === "google/gemini-2.0-flash-001"
            ? undefined
            : selectedModel,
      });

      console.log("[json result]:", result);

      if (result instanceof Response) {
        // This shouldn't happen with non-streaming calls, but handle it
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Received unexpected streaming response. Please try again.",
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const output = result.output;

      if (!output) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "No output received from the assistant.",
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: output.message || "Operation completed successfully.",
        role: "assistant",
        timestamp: new Date(),
        data: output.data,
        urpcCode: output.urpc_code || "",
        entity: output.entity,
        operation: output.operation,
        success: output.success,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update data displays based on entity type
      if (output.entity && output.success) {
        if (output.entity === "user") {
          if (Array.isArray(output.data)) {
            setUserData(output.data);
          } else if (
            output.data &&
            (output.operation === "findOne" ||
              output.operation === "update" ||
              output.operation === "create")
          ) {
            setUserData((prev) => {
              const index = prev.findIndex(
                (user) => user.id === output.data.id
              );
              if (index !== -1) {
                prev[index] = output.data;
                return [...prev];
              } else {
                return [...prev, output.data];
              }
            });
          }
        } else if (output.entity === "post") {
          if (Array.isArray(output.data)) {
            setPostData(output.data);
          } else if (
            output.data &&
            (output.operation === "findOne" ||
              output.operation === "update" ||
              output.operation === "create")
          ) {
            setPostData((prev) => {
              const index = prev.findIndex(
                (post) => post.id === output.data.id
              );
              if (index !== -1) {
                prev[index] = output.data;
                return [...prev];
              } else {
                return [...prev, output.data];
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";

      // Check if this is a configuration-related error
      if (err instanceof Error && isChatConfigError(err)) {
        setShowConfigHelper(true);
        setError("Chat service not configured. Please check server setup.");
      } else {
        setError(errorMessage);
      }

      // Update the assistant message to show error
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${errorMessage}`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        content:
          "Hello! I'm your AI assistant. I can help you query and analyze data. Try commands like 'Find all users' or 'Find all posts'.",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
    setError(null);
    setShowConfigHelper(false);
    setUserData([]);
    setPostData([]);
  };

  const copyConfigCode = () => {
    navigator.clipboard.writeText(SERVER_CONFIG_CODE);
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-[400px]",
        isEmbedded ? "flex-col w-96 h-[500px]" : "flex-row w-full",
        className
      )}
    >
      {/* Main Chat Area */}
      <Card
        className={cn(
          "flex flex-col",
          isEmbedded ? "w-full h-full shadow-lg border-2" : "flex-1 mr-4"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Thinking..." : "Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-xs px-2 h-7"
            >
              Clear
            </Button>
            {isEmbedded && onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-7 h-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Configuration Helper */}
        {showConfigHelper && (
          <div className="mx-4 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-amber-800 mb-2">
                  Server Configuration Required
                </h4>
                <p className="text-xs text-amber-700 mb-3">
                  Chat functionality requires MastraPlugin. Add this to your
                  server.ts:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono overflow-x-auto mb-3">
                  <pre className="whitespace-pre-wrap">
                    {SERVER_CONFIG_CODE}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyConfigCode}
                    className="text-xs h-6 px-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    <Code className="w-3 h-3 mr-1" />
                    Copy Code
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfigHelper(false)}
                    className="text-xs h-6 px-2 text-amber-600 hover:bg-amber-100"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {/* Welcome message with quick commands */}
            {messages.length === 1 && (
              <div className="text-center py-4">
                <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  💡 Try these commands:
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {quickCommands.map((command, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(command)}
                      className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded hover:bg-accent hover:text-accent-foreground transition-colors border border-border"
                      disabled={isLoading}
                    >
                      {command}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-3",
                  message.role === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                )}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs",
                      message.role === "user"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    "flex-1 max-w-[280px]",
                    message.role === "user" ? "flex flex-col items-end" : ""
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-muted"
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>

                    {/* Display URPC Code */}
                    {message.urpcCode && (
                      <div className="mt-2 p-2 bg-slate-900 text-slate-100 rounded text-xs font-mono">
                        <div className="text-slate-300 mb-1">URPC Code:</div>
                        {message.urpcCode}
                      </div>
                    )}

                    {/* Display Data */}
                    {message.data && (
                      <div className="mt-2 p-2 bg-slate-900 text-slate-100 rounded text-xs font-mono">
                        <div className="text-slate-300 mb-1">Data:</div>
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(message.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
                    <span>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.success !== undefined && (
                      <span
                        className={cn(
                          "px-1 py-0.5 rounded text-xs",
                          message.success
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {message.success ? "✓" : "✗"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-md p-3 rounded-lg bg-muted text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && !showConfigHelper && (
          <div className="mx-4 mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2 mb-2">
            {/* Model selection */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="appearance-none bg-background border border-input rounded px-2 py-1 pr-6 text-xs focus:outline-none focus:ring-1 focus:ring-ring min-w-[120px]"
                disabled={isLoading}
              >
                {availableModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift + Enter for new line
          </div>
        </div>
      </Card>

      {/* Data Display Sidebar - Only show when not embedded */}
      {!isEmbedded && (
        <div className="w-80 space-y-4">
          {/* User Data Display */}
          <Card className="h-64">
            <div className="border-b border-border p-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">User Data</h3>
              </div>
            </div>
            <ScrollArea className="h-48 p-3">
              {userData.length > 0 ? (
                <div className="space-y-2">
                  {userData.map((user) => (
                    <div key={user.id} className="bg-muted rounded p-2">
                      <div className="text-xs">
                        <div>
                          <strong>ID:</strong> {user.id}
                        </div>
                        <div>
                          <strong>Name:</strong> {user.name}
                        </div>
                        <div>
                          <strong>Email:</strong> {user.email}
                        </div>
                        {user.role && (
                          <div>
                            <strong>Role:</strong> {user.role}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 text-xs">
                  No user data available
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Post Data Display */}
          <Card className="h-64">
            <div className="border-b border-border p-3">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Post Data</h3>
              </div>
            </div>
            <ScrollArea className="h-48 p-3">
              {postData.length > 0 ? (
                <div className="space-y-2">
                  {postData.map((post) => (
                    <div key={post.id} className="bg-muted rounded p-2">
                      <div className="text-xs">
                        <div>
                          <strong>ID:</strong> {post.id}
                        </div>
                        {post.name && (
                          <div>
                            <strong>Name:</strong> {post.name}
                          </div>
                        )}
                        {post.title && (
                          <div>
                            <strong>Title:</strong> {post.title}
                          </div>
                        )}
                        {post.content && (
                          <div>
                            <strong>Content:</strong>{" "}
                            {post.content.substring(0, 50)}...
                          </div>
                        )}
                        {post.email && (
                          <div>
                            <strong>Email:</strong> {post.email}
                          </div>
                        )}
                        {post.role && (
                          <div>
                            <strong>Role:</strong> {post.role}
                          </div>
                        )}
                        {post.status && (
                          <div>
                            <strong>Status:</strong> {post.status}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 text-xs">
                  No post data available
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
}

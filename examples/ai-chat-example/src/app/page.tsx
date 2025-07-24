"use client";

export const runtime = 'edge';

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  User,
  Bot,
  Database,
  MessageSquare,
  Zap,
  ChevronDown,
} from "lucide-react";
import { repo } from "@unilab/urpc";
import { ChatEntity } from "@unilab/mastra-plugin/entities";
import { initUrpcClient } from "@/lib/urpc-client";
import DemoContainer from "@/components/demo-container";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: any;
  urpcCode?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface PostData {
  id: string;
  title: string;
  content: string;
  userId: string;
}

initUrpcClient();

export default function UrpcAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [postData, setPostData] = useState<PostData[]>([]);
  const [selectedModel, setSelectedModel] = useState(
    "google/gemini-2.0-flash-001"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available models
  const availableModels = [
    { value: "google/gemini-2.0-flash-001", label: "Google: Gemini 2.0 Flash" },
    {
      value: "google/gemini-2.5-flash-lite-preview-06-17",
      label: "Google: Gemini 2.5 Flash Lite Preview 06-17",
    },
    {
      value: "qwen/qwen3-32b",
      label: "Qwen: Qwen3 32B",
    },
    {
      value: "deepseek/deepseek-chat-v3-0324",
      label: "DeepSeek: DeepSeek V3 0324",
    },
    { value: "moonshotai/kimi-k2", label: "MoonshotAI: Kimi K2" },
  ];

  // Quick operation commands
  const quickCommands = ["Find all users", "Find all posts"];

  const testCases = [
    "Create a new user named John with email john@example.com, and avatar https://api.dicebear.com/7.x/avataaars/svg?seed=John, id is '1'",
    "Find all users",
    "Find user with ID 1",
    "Find all posts by users with userId 1",
    'Create an article with title "Test Article", content "This is a test article", author userId is "1"',
    'Update user 1\'s name to "John Doe"',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const result = await repo<ChatEntity>({
        entity: "chat",
        source: "mastra",
      }).call({
        input: textToSend,
        model:
          selectedModel === "google/gemini-2.0-flash-001"
            ? undefined
            : selectedModel,
      });

      if (result instanceof Response) {
        // stream response, not supported yet
        return;
      }

      const output = result.output;

      if (!output) {
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: output.message,
        timestamp: new Date(),
        data: output.data,
        urpcCode: output.urpc_code || "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update right side data display
      if (output.entity) {
        if (output.entity === "user") {
          if (Array.isArray(output.data)) {
            setUserData(output.data);
          } else if (
            (output.operation === "findOne" || output.operation === "update") &&
            output.data
          ) {
            setUserData((prev) => {
              const index = prev.findIndex(
                (user) => user.id === output.data.id
              );
              if (index !== -1) {
                prev[index] = output.data;
              } else {
                prev.push(output.data);
              }
              return prev;
            });
          } else if (output.operation === "create" && output.data) {
            setUserData((prev) => [...prev, output.data]);
          } else if (output.operation === "delete" && output.success) {
            // Handle delete operation - extract user name from message
            const deleteMatch = textToSend.match(/Delete user (.+?)$/);
            if (deleteMatch) {
              const userName = deleteMatch[1].trim();
              setUserData((prev) =>
                prev.filter((user) => user.name !== userName)
              );
            }
          }
        } else if (output.entity === "post") {
          if (Array.isArray(output.data)) {
            setPostData(output.data);
          } else if (
            (output.operation === "findOne" || output.operation === "update") &&
            output.data
          ) {
            setPostData((prev) => {
              const index = prev.findIndex(
                (post) => post.id === output.data.id
              );
              if (index !== -1) {
                prev[index] = output.data;
              } else {
                prev.push(output.data);
              }
              return prev;
            });
          } else if (output.operation === "create" && output.data) {
            setPostData((prev) => [...prev, output.data]);
          } else if (output.operation === "delete" && output.success) {
            // Handle delete post operation
            const deleteMatch = textToSend.match(/ID (.+?)$/);
            if (deleteMatch) {
              const identifier = deleteMatch[1].trim();
              setPostData((prev) =>
                prev.filter(
                  (post) => post.title !== identifier && post.id !== identifier
                )
              );
            }
          }
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, an error occurred. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DemoContainer title="URPC Intelligent Agent Demo">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left chat area */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-lg border border-border">
              {/* Chat header */}
              <div className="border-b border-border p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded-full">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Smart Chat
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Interact with URPC Agent through natural language to
                      perform data CRUD operations
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat messages area */}
              <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Start chatting with URPC Agent!
                    </p>

                    {/* Quick action buttons */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        💡 Try these commands:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickCommands.map((command, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(command)}
                            className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full hover:bg-accent hover:text-accent-foreground transition-colors border border-border"
                          >
                            {command}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs font-medium ">
                          {message.role === "user" ? "You" : "URPC Assistant"}
                        </span>
                      </div>
                      <div className="text-sm">{message.content}</div>
                      {message.urpcCode && (
                        <>
                          {/* Display URPC code */}
                          <div className="mt-2 p-2 bg-gradient-background rounded text-foreground text-xs font-mono border border-border">
                            <div className="text-muted-foreground">
                              URPC Code:
                            </div>
                            <SyntaxHighlighter
                              language="typescript"
                              style={oneDark}
                              customStyle={{
                                margin: 0,
                                padding: "12px",
                                fontSize: "11px",
                                background: "transparent",
                                overflow: "auto",
                              }}
                              codeTagProps={{
                                style: {
                                  background: "transparent",
                                },
                              }}
                              showLineNumbers={false}
                              showInlineLineNumbers={false}
                              wrapLines={false}
                              wrapLongLines={true}
                            >
                              {message.urpcCode}
                            </SyntaxHighlighter>
                          </div>
                          {/* Display data */}
                          <div className="mt-2 p-2 bg-gradient-background rounded text-foreground text-xs font-mono border border-border">
                            <div className="text-muted-foreground">Data:</div>
                            <SyntaxHighlighter
                              language="json"
                              style={oneDark}
                              customStyle={{
                                margin: 0,
                                padding: "12px",
                                fontSize: "11px",
                                background: "transparent",
                                overflow: "auto",
                              }}
                              codeTagProps={{
                                style: {
                                  background: "transparent",
                                },
                              }}
                              showLineNumbers={false}
                              showInlineLineNumbers={false}
                              wrapLines={false}
                              wrapLongLines={true}
                            >
                              {JSON.stringify(message.data, null, 2)}
                            </SyntaxHighlighter>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-md p-3 rounded-lg bg-muted text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground"></div>
                        <span className="text-sm">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-border p-4">
                <div className="flex space-x-2">
                  {/* Model selection dropdown */}
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="appearance-none bg-gradient-background border border-input rounded-lg px-3 py-2 pr-8 text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[140px] h-10"
                      disabled={isLoading}
                    >
                      {availableModels.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your command..."
                    className="flex-1 px-3 py-2 bg-gradient-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground h-10"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-10 flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right data display area */}
          <div className="space-y-4">
            {/* User data display */}
            <div className="bg-card rounded-lg shadow-lg border border-border">
              <div className="border-b border-border p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">User Data</h3>
                </div>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {userData.length > 0 ? (
                  <div className="space-y-2">
                    {userData.map((user) => (
                      <div key={user.id} className="bg-muted rounded p-3">
                        <div className="text-xs text-foreground">
                          <div>
                            <strong>ID:</strong> {user.id}
                          </div>
                          <div>
                            <strong>Name:</strong> {user.name}
                          </div>
                          <div>
                            <strong>Email:</strong> {user.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No user data available
                  </div>
                )}
              </div>
            </div>

            {/* Post data display */}
            <div className="bg-card rounded-lg shadow-lg border border-border">
              <div className="border-b border-border p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Post Data</h3>
                </div>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {postData.length > 0 ? (
                  <div className="space-y-2">
                    {postData.map((post) => (
                      <div key={post.id} className="bg-muted rounded p-3">
                        <div className="text-xs text-foreground">
                          <div>
                            <strong>ID:</strong> {post.id}
                          </div>
                          <div>
                            <strong>Title:</strong> {post.title}
                          </div>
                          <div>
                            <strong>Content:</strong> {post.content}
                          </div>
                          <div>
                            <strong>Author ID:</strong> {post.userId}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No post data available
                  </div>
                )}
              </div>
            </div>

            {/* Quick commands */}
            <div className="bg-card rounded-lg shadow-lg border border-border">
              <div className="border-b border-border p-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 w-3 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">
                    Try these commands
                  </h3>
                </div>
              </div>
              <div className="p-2 grid grid-cols-1 gap-1">
                {testCases.map((testCase, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(testCase)}
                    className="w-full text-left p-1.5 bg-muted hover:bg-accent rounded text-xs transition-colors duration-200 border border-border hover:border-accent cursor-pointer"
                    disabled={isLoading}
                    title={testCase}
                  >
                    <div className="text-xs font-medium text-foreground truncate">
                      {testCase}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoContainer>
  );
}

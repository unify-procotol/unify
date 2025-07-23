"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, MessageSquare, X } from "lucide-react";
import { repo } from "@unilab/urpc";
import { ChatEntity } from "@unilab/mastra-plugin/entities";
import { initUrpcClient } from "@/lib/urpc-client";
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

initUrpcClient();

export default function ChatWidget({
  entity,
  source,
  quickCommands,
  onSuccess,
}: {
  entity: string;
  source: string;
  quickCommands?: string[];
  onSuccess?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
        entity,
        source,
      }).call({
        input: textToSend,
        model:
          selectedModel === "google/gemini-2.0-flash-001"
            ? undefined
            : selectedModel,
      });

      const output = result.output;
      console.log("output=>", output);

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

      if (output.success) {
        onSuccess?.();
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* Quick Commands - Left Side (Desktop Only) */}
        {isOpen && quickCommands && quickCommands.length > 0 && (
          <div className="hidden md:block absolute right-full top-0 mr-2">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-border/50 rounded-lg p-2 shadow-lg">
              <div className="text-xs text-white mb-1 font-medium">
                ⚡ Quick Commands
              </div>
              <div className="flex flex-col gap-1 min-w-[200px]">
                {quickCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(command)}
                    disabled={isLoading}
                    className="px-2 py-1 text-xs bg-background/40 hover:bg-background/60 hover:scale-105 text-foreground rounded border border-border/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer text-left"
                  >
                    {command}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Widget */}
        {isOpen && (
          <div className="mb-4 w-[480px] h-[700px] bg-card rounded-lg shadow-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-secondary text-secondary-foreground p-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span className="font-medium text-xs">URPC Assistant</span>
              </div>
              <X className="h-4 w-4 cursor-pointer" onClick={closeChat} />
            </div>

            {/* Messages */}
            <div className="h-[540px] overflow-y-auto p-4 space-y-3 bg-background">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Hi! I'm your URPC Assistant. How can I help you today?
                  </p>
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
                    className={`max-w-[85%] p-3 rounded-lg text-sm ${
                      message.role === "user"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {message.role === "user" ? "You" : "Assistant"}
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed break-words">
                      {message.content}
                    </div>
                    {message.urpcCode && (
                      <div className="mt-2 p-2 bg-black/10 rounded text-xs font-mono">
                        <div className="text-xs opacity-75">URPC Code:</div>
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
                    )}
                    {message.data && (
                      <div className="mt-2 p-2 bg-black/10 rounded text-xs font-mono">
                        <div className="text-xs opacity-75">Data:</div>
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
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              {/* Model Selection */}
              <div className="mb-3">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full text-sm bg-background border border-input rounded px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  disabled={isLoading}
                >
                  {availableModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Input */}
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 bg-background border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-3 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Button */}
        {!isOpen && (
          <button
            onClick={toggleChat}
            className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}

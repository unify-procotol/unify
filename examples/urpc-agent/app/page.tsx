"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Database, MessageSquare, Zap } from "lucide-react";

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
  avatar?: string;
}

interface PostData {
  id: string;
  title: string;
  content: string;
  userId: string;
  user?: UserData;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [postData, setPostData] = useState<PostData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick operation commands
  const quickCommands = ["Find all users", "Find all posts by users with ID 1"];

  const testCases = [
    "Find all users",
    "Find user with ID 1",
    "Create a new user named Jack with email jack@example.com",
    "Find all posts by users with ID 1",
    'Create an article with title "Test Article", content "This is a test article", author is user 1',
    'Update user 1\'s name to "John Doe"',
    "Delete article with ID 1",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        data: data.data,
        urpcCode: data.urpc_code,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update right side data display
      if (data.entity) {
        if (data.entity === "user") {
          if (Array.isArray(data.data)) {
            setUserData(data.data);
          } else if (
            (data.operation === "findOne" || data.operation === "update") &&
            data.data
          ) {
            setUserData((prev) => {
              const index = prev.findIndex((user) => user.id === data.data.id);
              if (index !== -1) {
                prev[index] = data.data;
              } else {
                prev.push(data.data);
              }
              return prev;
            });
          } else if (data.operation === "create" && data.data) {
            setUserData((prev) => [...prev, data.data]);
          } else if (data.operation === "delete" && data.success) {
            // Handle delete operation - extract user name from message
            const deleteMatch = textToSend.match(/Delete user (.+?)$/);
            if (deleteMatch) {
              const userName = deleteMatch[1].trim();
              setUserData((prev) =>
                prev.filter((user) => user.name !== userName)
              );
            }
          }
        } else if (data.entity === "post") {
          if (Array.isArray(data.data)) {
            setPostData(data.data);
          } else if (
            (data.operation === "findOne" || data.operation === "update") &&
            data.data
          ) {
            setPostData((prev) => {
              const index = prev.findIndex((post) => post.id === data.data.id);
              if (index !== -1) {
                prev[index] = data.data;
              } else {
                prev.push(data.data);
              }
              return prev;
            });
          } else if (data.operation === "create" && data.data) {
            setPostData((prev) => [...prev, data.data]);
          } else if (data.operation === "delete" && data.success) {
            // Handle delete post operation
            const deleteMatch =
              textToSend.match(/Delete post (.+?)$/) ||
              textToSend.match(/Delete post with ID (.+?)$/);
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
        content:
          "Sorry, an error occurred while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto p-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">
              URPC Intelligent Agent Demo
            </h1>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left chat area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800">
              {/* Chat header */}
              <div className="border-b border-gray-800 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-800 rounded-full">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Smart Chat</h3>
                    <p className="text-sm text-gray-300">
                      Interact with URPC Agent through natural language to
                      realize CRUD operations on data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat messages area */}
              <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">
                      Start chatting with URPC Agent!
                    </p>

                    {/* Quick action buttons */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 mb-2">
                        💡 Try these commands:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickCommands.map((command, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(command)}
                            className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full hover:bg-gray-700 transition-colors border border-gray-600"
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
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-md p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-gray-700 text-white"
                          : "bg-gray-800 text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs font-medium">
                          {message.role === "user" ? "You" : "URPC Assistant"}
                        </span>
                      </div>
                      <div className="text-sm">{message.content}</div>
                      {message.urpcCode && (
                        <>
                          {/* Display URPC code */}
                          <div className="mt-2 p-2 bg-black rounded text-gray-300 text-xs font-mono border border-gray-600">
                            <div className="text-gray-400 mb-1">URPC Code:</div>
                            {message.urpcCode}
                          </div>
                          {/* Display data */}
                          <div className="mt-2 p-2 bg-black rounded text-gray-300 text-xs font-mono border border-gray-600">
                            <div className="text-gray-400 mb-1">Data:</div>
                            {JSON.stringify(message.data, null, 2)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-md p-3 rounded-lg bg-gray-800 text-white">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        <span className="text-sm">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-gray-800 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your command..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right data display area */}
          <div className="space-y-6 h-[calc(100vh-110px)] overflow-y-auto">
            {/* User data */}
            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800">
              <div className="border-b border-gray-800 p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-white">User Data</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {userData.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 bg-gray-800 rounded border border-gray-700"
                  >
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-300">{user.email}</div>
                      <div className="text-xs text-gray-500">ID: {user.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Post data */}
            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800">
              <div className="border-b border-gray-800 p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-white">Post Data</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {postData.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 bg-gray-800 rounded border border-gray-700"
                  >
                    <div className="font-medium text-white mb-1">
                      {post.title}
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      {post.content}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Author ID: {post.userId}</span>
                      <span>ID: {post.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800">
              <div className="border-b border-gray-800 p-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 w-3 text-gray-400" />
                  <h3 className="text-sm font-medium text-white">
                    Try these commands
                  </h3>
                </div>
              </div>
              <div className="p-2 grid grid-cols-1 gap-1">
                {testCases.map((testCase, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(testCase)}
                    className="w-full text-left p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors duration-200 border border-gray-700 hover:border-gray-500"
                    disabled={isLoading}
                    title={testCase}
                  >
                    <div className="text-xs font-medium text-gray-300 truncate">
                      {testCase}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

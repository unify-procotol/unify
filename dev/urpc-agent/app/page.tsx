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

  // 快速操作命令
  const quickCommands = ["查找所有用户", "创建用户王五", "删除用户张三"];

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

      // 更新右侧数据显示
      if (data.entity) {
        if (data.entity === "user") {
          if (Array.isArray(data.data)) {
            setUserData(data.data);
          } else if (
            data.operation === "findOne" ||
            data.operation === "update"
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
            // 处理删除操作 - 从消息中提取用户名
            const deleteMatch = textToSend.match(/删除用户(.+?)$/);
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
            data.operation === "findOne" ||
            data.operation === "update"
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
            // 处理删除文章操作
            const deleteMatch =
              textToSend.match(/删除文章(.+?)$/) ||
              textToSend.match(/删除ID为(.+?)的文章/);
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
        content: "抱歉，处理请求时出现错误。请稍后再试。",
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
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              URPC智能Agent演示
            </h1>
            <p className="text-gray-600">通过自然语言与数据库进行智能交互</p>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧聊天区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              {/* 聊天头部 */}
              <div className="border-b p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">智能对话</h3>
                    <p className="text-sm text-gray-600">
                      尝试说："查找所有用户"、"创建一个用户"、"删除某个用户"等
                    </p>
                  </div>
                </div>
              </div>

              {/* 聊天消息区域 */}
              <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">开始与URPC Agent对话！</p>

                    {/* 快速操作按钮 */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400 mb-2">
                        💡 试试这些命令：
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickCommands.map((command, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(command)}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 transition-colors"
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
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs font-medium">
                          {message.role === "user" ? "您" : "URPC助手"}
                        </span>
                      </div>
                      <div className="text-sm">{message.content}</div>

                      {/* 显示URPC代码 */}
                      {message.urpcCode && (
                        <div className="mt-2 p-2 bg-gray-800 rounded text-green-400 text-xs font-mono">
                          <div className="text-gray-400 mb-1">URPC代码:</div>
                          {message.urpcCode}
                        </div>
                      )}

                      {/* 显示数据 */}
                      {message.data && (
                        <div className="mt-2 p-2 bg-gray-800 rounded text-green-400 text-xs font-mono">
                          <div className="text-gray-400 mb-1">数据:</div>
                          {JSON.stringify(message.data, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-md p-3 rounded-lg bg-gray-100 text-gray-800">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span className="text-sm">正在处理...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入您的指令..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧数据展示区域 */}
          <div className="space-y-6">
            {/* 用户数据 */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">用户数据</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {userData.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500">ID: {user.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 文章数据 */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">文章数据</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {postData.map((post) => (
                  <div key={post.id} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900 mb-1">
                      {post.title}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {post.content}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>作者ID: {post.userId}</span>
                      <span>ID: {post.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

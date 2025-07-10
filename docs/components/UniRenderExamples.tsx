"use client";

import { UniRender } from "@unilab/ukit";
import { repo, URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { Logging } from "@unilab/urpc-core/middleware";
import { useState, useEffect } from "react";
import { UserEntity } from "./entities/user"

const MyPlugin: Plugin = {
  entities: [UserEntity],
};

// 全局变量跟踪当前会话的初始化状态
let isSessionInitialized = false;

interface ExampleProps {
  type: 'basic' | 'table-editable' | 'card' | 'form' | 'grid' | 'list' | 'dashboard' | 'loading' | 'error' | 'empty';
}

export function UniRenderExample({ type }: ExampleProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeURPC = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 动态导入MockAdapter，避免SSR问题
        const { MockAdapter } = await import("@unilab/urpc-adapters");
        
        // 只在客户端初始化URPC
        URPC.init({
          plugins: [MyPlugin],
          middlewares: [Logging()],
          entityConfigs: {
            user: {
              defaultSource: "mock",
            },
          },
          globalAdapters: [MockAdapter],
        });

        // 使用全局变量检查当前会话是否已经初始化过数据
        if (!isSessionInitialized) {
          console.log("Creating initial mock data...");
          
          // 创建一些mock数据
          await repo({
            entity: "user",
          }).create({
            data: {
              id: "1",
              name: "John Doe",
              email: "john.doe@example.com",
              role: "Admin",
              isActive: true,
              avatar: "https://example.com/avatar1.png",
            },
          });

          await repo({
            entity: "user",
          }).create({
            data: {
              id: "2",
              name: "Jane Smith",
              email: "jane.smith@example.com",
              role: "User",
              isActive: true,
              avatar: "https://example.com/avatar2.png",
            },
          });

          await repo({
            entity: "user",
          }).create({
            data: {
              id: "3",
              name: "Bob Johnson",
              email: "bob.johnson@example.com",
              role: "Manager",
              isActive: false,
              avatar: "https://example.com/avatar3.png",
            },
          });
          
          // 标记当前会话已初始化
          isSessionInitialized = true;
          console.log("Mock data created successfully");
        } else {
          console.log("Mock data already initialized in this session, skipping creation");
        }

        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize URPC');
      } finally {
        setLoading(false);
      }
    };

    if (!isInitialized) {
      initializeURPC();
    }
  }, [isInitialized]);

  // 如果还在初始化或出错，显示对应状态
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Initializing URPC...</div>
          <div className="text-gray-400 text-sm mt-1">
            Setting up data adapters and mock data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-red-400">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="text-red-600 text-lg font-semibold mb-2">
            Initialization Failed
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsInitialized(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 只有在URPC完全初始化后才渲染UniRender组件
  if (!isInitialized) {
    return null;
  }

  const handleEdit = async (updatedRecord: any, index: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Updated record:', updatedRecord);
  };

  const handleDelete = async (record: any, index: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Deleted record:', record);
  };

  const examples = {
    basic: {
      entity: "user",
      source: "mock",
      layout: 'table' as const,
      config: {
        id: { label: 'ID', width: '60px' },
        name: { label: 'Full Name' },
        email: { label: 'Email Address' },
        role: { label: 'Role' },
        isActive: { 
          label: 'Status',
          render: (value: boolean) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value ? 'Active' : 'Inactive'}
            </span>
          )
        }
      },
      generalConfig: {
        showActions: true,
        actions: {
          edit: true,
          delete: true
        }
      }
    },
    'table-editable': {
      entity: "user",
      source: "mock",
      layout: 'table' as const,
      config: {
        id: { label: 'ID', width: '60px', editable: false },
        name: { 
          label: 'Full Name', 
          editable: true,
          required: true,
          type: 'text'
        },
        email: { 
          label: 'Email Address', 
          editable: true,
          required: true,
          type: 'email'
        },
        role: { 
          label: 'Role',
          editable: true,
          type: 'select',
          options: ['Admin', 'User', 'Manager']
        },
        isActive: { 
          label: 'Status',
          editable: true,
          type: 'checkbox',
          render: (value: boolean) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value ? 'Active' : 'Inactive'}
            </span>
          )
        }
      },
      generalConfig: {
        editable: true,
        showActions: true,
        actions: {
          edit: true,
          delete: true
        }
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    },
    card: {
      entity: "user",
      source: "mock",
      layout: 'card' as const,
      config: {
        name: { 
          label: 'Name',
          render: (value: string) => (
            <span className="text-lg font-bold text-gray-900">
              {value}
            </span>
          )
        },
        role: { 
          label: 'Role',
          render: (value: string) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value === 'Admin' ? 'bg-purple-100 text-purple-800' :
              value === 'Manager' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {value}
            </span>
          )
        },
        email: {
          label: 'Email',
          render: (value: string) => (
            <span className="text-sm text-gray-600">
              {value}
            </span>
          )
        },
        isActive: { 
          label: 'Status',
          render: (value: boolean) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value ? 'Active' : 'Inactive'}
            </span>
          )
        }
      }
    },
    form: {
      entity: "user",
      source: "mock",
      query: {
        where: { id: "1" }
      },
      layout: 'form' as const,
      config: {
        name: { label: 'Full Name' },
        email: { label: 'Email Address' },
        role: { label: 'Role' },
        isActive: { 
          label: 'Active Status',
          render: (value: boolean) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value ? 'Active' : 'Inactive'}
            </span>
          )
        }
      }
    },
    grid: {
      entity: "user",
      source: "mock",
      layout: 'grid' as const,
      config: {
        name: { label: 'Name' },
        role: { 
          label: 'Role',
          render: (value: string) => (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {value}
            </span>
          )
        },
        email: { 
          label: 'Email',
          render: (value: string) => (
            <span className="text-sm text-gray-600">{value}</span>
          )
        },
        isActive: { 
          label: 'Status',
          render: (value: boolean) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value ? '✅ Active' : '❌ Inactive'}
            </span>
          )
        }
      }
    },
    list: {
      entity: "user",
      source: "mock",
      layout: 'list' as const,
      config: {
        name: { label: 'Name' },
        email: { label: 'Email' },
        role: { label: 'Role' },
        isActive: { 
          label: 'Status',
          render: (value: boolean) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value ? 'Active' : 'Inactive'}
            </span>
          )
        }
      }
    },
    dashboard: {
      entity: "user",
      source: "mock",
      layout: 'dashboard' as const,
      config: {
        name: { label: 'User' },
        role: { 
          label: 'Role',
          render: (value: string) => value
        },
        email: { 
          label: 'Email',
          render: (value: string) => value
        },
        isActive: { 
          label: 'Status',
          render: (value: boolean) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value ? 'Active' : 'Inactive'}
            </span>
          )
        }
      }
    },
    loading: {
      entity: "user",
      source: "mock",
      layout: 'table' as const,
      loading: true
    },
    error: {
      entity: "user",
      source: "mock",
      layout: 'table' as const,
      loading: false,
      error: "Failed to load orders: Network connection timeout"
    },
    empty: {
      entity: "user",
      source: "mock",
      query: {
        where: { id: "nonexistent" }
      },
      layout: 'table' as const,
      loading: false,
      error: null
    }
  };

  const baseProps = examples[type];
  
  // 动态创建最终的 props，避免类型错误
  const finalProps: any = { ...baseProps };
  
  // 对于特殊状态的示例，保持原样
  if (type === 'loading') {
    finalProps.loading = true;
  } else if (type === 'error') {
    finalProps.loading = false;
    finalProps.error = "Failed to load orders: Network connection timeout";
  } else if (type === 'empty') {
    finalProps.loading = false;
    finalProps.error = null;
  } else {
    // 对于正常示例，URPC已经初始化完成，不需要loading状态
    finalProps.loading = false;
    finalProps.error = null;
  }
  
  // 确保必需属性存在
  finalProps.entity = finalProps.entity || "user";
  finalProps.layout = finalProps.layout || "table";
  
  // 添加调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('UniRender props:', finalProps);
  }
  
  return <UniRender {...finalProps} />;
} 
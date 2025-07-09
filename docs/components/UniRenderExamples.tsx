"use client";

import { UniRender } from "@unilab/ukit";
import { repo, URPC } from "@unilab/urpc-client";
import { useState, useEffect } from "react";

interface ExampleProps {
  type: 'basic' | 'table-editable' | 'card' | 'form' | 'grid' | 'list' | 'dashboard' | 'loading' | 'error' | 'empty';
}

URPC.init({
  baseUrl: `${window.location.origin}/api`,
});

export function UniRenderExample({ type }: ExampleProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize data');
      } finally {
        setLoading(false);
      }
    };

    if (!isInitialized) {
      initializeData();
    }
  }, [isInitialized]);

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
      
      layout: 'card' as const,
      config: {
        price: { 
          label: 'Price',
          render: (value: number) => (
            <span className="text-lg font-bold text-green-600">
              ${value.toFixed(2)}
            </span>
          )
        },
        inStock: { 
          label: 'Stock Status',
          render: (value: boolean) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value ? 'In Stock' : 'Out of Stock'}
            </span>
          )
        },
        category: {
          label: 'Category',
          render: (value: string) => (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {value}
            </span>
          )
        }
      }
    },
    form: {
      entity: "user",
      
      query: {
        where: { id: "1" }
      },
      layout: 'form' as const,
      config: {
        firstName: { label: 'First Name' },
        lastName: { label: 'Last Name' },
        email: { label: 'Email Address' },
        phone: { label: 'Phone Number' },
        department: { label: 'Department' },
        joinDate: { 
          label: 'Join Date',
          render: (value: string) => new Date(value).toLocaleDateString()
        },
        isManager: { 
          label: 'Management Role',
          render: (value: boolean) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {value ? 'Manager' : 'Team Member'}
            </span>
          )
        }
      }
    },
    grid: {
      entity: "user",
      
      layout: 'grid' as const,
      config: {
        title: { label: 'Title' },
        category: { 
          label: 'Category',
          render: (value: string) => (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {value}
            </span>
          )
        },
        views: { 
          label: 'Views',
          render: (value: number) => `${value.toLocaleString()} views`
        },
        likes: { 
          label: 'Likes',
          render: (value: number) => `${value} ❤️`
        }
      }
    },
    list: {
      entity: "user",
      
      layout: 'list' as const,
      config: {
        sender: { label: 'From' },
        subject: { label: 'Subject' },
        preview: { label: 'Preview' },
        timestamp: { 
          label: 'Time',
          render: (value: string) => new Date(value).toLocaleString()
        },
        isRead: { 
          label: 'Read Status',
          render: (value: boolean) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {value ? 'Read' : 'Unread'}
            </span>
          )
        },
        priority: { 
          label: 'Priority',
          render: (value: string) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value === 'high' ? 'bg-red-100 text-red-800' :
              value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          )
        }
      }
    },
    dashboard: {
      entity: "user",
      
      layout: 'dashboard' as const,
      config: {
        metric: { label: 'Metric' },
        value: { 
          label: 'Value',
          render: (value: number, record: any) => {
            if (record.metric.includes('Revenue') || record.metric.includes('Value')) {
              return `$${value.toLocaleString()}`;
            }
            if (record.metric.includes('Rate')) {
              return `${value}%`;
            }
            return value.toLocaleString();
          }
        },
        change: { 
          label: 'Change',
          render: (value: number) => (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              value > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value > 0 ? '+' : ''}{value}%
            </span>
          )
        },
        trend: { 
          label: 'Trend',
          render: (value: string) => value === 'up' ? '📈' : value === 'down' ? '📉' : '➡️'
        },
        target: { 
          label: 'Target',
          render: (value: number, record: any) => {
            if (record.metric.includes('Revenue') || record.metric.includes('Value')) {
              return `$${value.toLocaleString()}`;
            }
            if (record.metric.includes('Rate')) {
              return `${value}%`;
            }
            return value.toLocaleString();
          }
        },
        period: { label: 'Period' }
      }
    },
    loading: {
      entity: "user",
      
      layout: 'table' as const,
      loading: true
    },
    error: {
      entity: "user",
      
      layout: 'table' as const,
      loading: false,
      error: "Failed to load orders: Network connection timeout"
    },
    empty: {
      entity: "user",
      
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
  
  // 对于非特殊状态的示例，使用当前的 loading 和 error 状态
  if (type !== 'loading' && type !== 'error' && type !== 'empty') {
    finalProps.loading = loading;
    finalProps.error = error;
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
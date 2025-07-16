"use client";

import { UniRender } from "@unilab/ukit";
import { useURPCProvider } from "./shared/urpc-provider";
import { LoadingState, ErrorState } from "./shared/common-ui";
import { renderCustomCardLayout } from "./shared/custom-layouts";

interface ExampleProps {
  type: 'basic' | 'table-editable' | 'card' | 'form' | 'grid' | 'list' | 'dashboard' | 'loading' | 'error' | 'empty' | 'custom-basic' | 'custom-magazine' | 'custom-social' | 'custom-blog' | 'custom-minimal';
}

export function UniRenderExample({ type }: ExampleProps) {
  const { isInitialized, loading, error, retryInitialization } = useURPCProvider();

  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={retryInitialization} />;
  }

  // Only render after URPC is initialized
  if (!isInitialized) {
    return null;
  }

  const handleEdit = async (updatedRecord: any, index: number) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Updated record:', updatedRecord);
  };

  const handleDelete = async (record: any, index: number) => {
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
    },
    'custom-basic': {
      entity: "post",
      source: "mock",
      layout: 'custom' as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: 'Title' },
        content: { label: 'Content' },
        role: { label: 'Role' },
        type: { label: 'Type' },
        category: { label: 'Category' },
        status: { label: 'Status' },
        isActive: { label: 'Active' },
        createdAt: { label: 'Created' }
      },
      pagination: {
        enabled: true,
        pageSize: 6,
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    },
    'custom-magazine': {
      entity: "post",
      source: "mock",
      layout: 'custom' as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: 'Article Title' },
        content: { label: 'Content' },
        role: { label: 'Department' },
        type: { label: 'Type' },
        category: { label: 'Category' },
        status: { label: 'Status' },
      },
      pagination: {
        enabled: true,
        pageSize: 8,
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    },
    'custom-social': {
      entity: "post",
      source: "mock",
      layout: 'custom' as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: 'Post Title' },
        content: { label: 'Content' },
        role: { label: 'User Role' },
        type: { label: 'Post Type' },
        category: { label: 'Category' },
        status: { label: 'Status' },
      },
      pagination: {
        enabled: true,
        pageSize: 9,
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    },
    'custom-blog': {
      entity: "post",
      source: "mock",
      layout: 'custom' as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: 'Blog Title' },
        content: { label: 'Content' },
        role: { label: 'Author Role' },
        type: { label: 'Post Type' },
        category: { label: 'Category' },
        status: { label: 'Status' },
      },
      pagination: {
        enabled: true,
        pageSize: 4,
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    },
    'custom-minimal': {
      entity: "post",
      source: "mock",
      layout: 'custom' as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: 'Title' },
        content: { label: 'Description' },
        role: { label: 'Role' },
        status: { label: 'Status' },
      },
      pagination: {
        enabled: true,
        pageSize: 12,
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    }
  };

  const baseProps = examples[type];
  
  // Dynamically create final props to avoid type errors
  const finalProps: any = { ...baseProps };
  
  // For special states, keep as is
  if (type === 'loading') {
    finalProps.loading = true;
  } else if (type === 'error') {
    finalProps.loading = false;
    finalProps.error = "Failed to load orders: Network connection timeout";
  } else if (type === 'empty') {
    finalProps.loading = false;
    finalProps.error = null;
  } else {
    // For normal examples, URPC is fully initialized, no loading state needed
    finalProps.loading = false;
    finalProps.error = null;
  }
  
  // Ensure required properties exist
  finalProps.entity = finalProps.entity || "user";
  finalProps.layout = finalProps.layout || "table";
  
  // Add debug information
  if (process.env.NODE_ENV === 'development') {
    console.log('UniRender props:', finalProps);
  }
  
  return <UniRender {...finalProps} />;
}

// Export with backward compatibility
export { UniRenderExample as UniRenderCustomLayout }; 
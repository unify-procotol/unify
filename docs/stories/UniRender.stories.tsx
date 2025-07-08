import type { Meta, StoryObj } from '@storybook/react';
import { UniRender, Entity, FieldConfig, LayoutType } from '@unilab/urpc-ui';

// Sample entities for demonstration
const userEntity: Entity = {
  name: 'UserEntity',
  fields: [
    { name: 'id', type: 'number', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'age', type: 'number' },
    { name: 'isActive', type: 'boolean' },
    { name: 'createdAt', type: 'date' },
    { name: 'address', type: 'object' }
  ]
};

const productEntity: Entity = {
  name: 'ProductEntity',
  fields: [
    { name: 'id', type: 'number', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'price', type: 'number', required: true },
    { name: 'category', type: 'string' },
    { name: 'inStock', type: 'boolean' },
    { name: 'rating', type: 'number' },
    { name: 'description', type: 'string' }
  ]
};

// Sample data
const userData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    address: { city: 'New York', country: 'USA' }
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 30,
    isActive: false,
    createdAt: '2024-01-10T09:15:00Z',
    address: { city: 'London', country: 'UK' }
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    age: 17,
    isActive: true,
    createdAt: '2024-01-20T14:45:00Z',
    address: { city: 'Tokyo', country: 'Japan' }
  }
];

const productData = [
  {
    id: 1,
    name: 'MacBook Pro',
    price: 2499,
    category: 'Electronics',
    inStock: true,
    rating: 4.8,
    description: 'High-performance laptop for professionals'
  },
  {
    id: 2,
    name: 'iPhone 15',
    price: 1199,
    category: 'Electronics',
    inStock: false,
    rating: 4.6,
    description: 'Latest smartphone with advanced features'
  },
  {
    id: 3,
    name: 'Office Chair',
    price: 299,
    category: 'Furniture',
    inStock: true,
    rating: 4.2,
    description: 'Ergonomic chair for comfortable work'
  }
];

// Field configuration with custom rendering and ordering
const userFieldConfig: Record<string, FieldConfig> = {
  id: { 
    order: 1, 
    label: 'User ID', 
    width: '80px', 
    align: 'center',
    render: (value) => (
      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-mono">
        #{value}
      </span>
    )
  },
  name: { 
    order: 2, 
    label: 'Full Name', 
    width: '200px',
    render: (value) => (
      <span className="font-semibold text-gray-200">{value}</span>
    )
  },
  email: { 
    order: 3, 
    label: 'Email Address',
    render: (value) => (
      <a href={`mailto:${value}`} className="text-blue-400 hover:underline">
        {value}
      </a>
    )
  },
  age: { 
    order: 4, 
    label: 'Age', 
    align: 'center',
    render: (value) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        value >= 18 
          ? 'bg-green-600/20 text-green-400' 
          : 'bg-yellow-600/20 text-yellow-400'
      }`}>
        {value} {value >= 18 ? '(Adult)' : '(Minor)'}
      </span>
    )
  },
  isActive: { 
    order: 5, 
    label: 'Status', 
    align: 'center',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        value 
          ? 'bg-green-600/20 text-green-400' 
          : 'bg-red-600/20 text-red-400'
      }`}>
        {value ? '● Active' : '● Inactive'}
      </span>
    )
  },
  createdAt: { 
    order: 6, 
    label: 'Created Date',
    render: (value) => (
      <div className="text-xs">
        <div className="text-cyan-400 font-mono">
          {new Date(value).toLocaleDateString()}
        </div>
        <div className="text-gray-500">
          {new Date(value).toLocaleTimeString()}
        </div>
      </div>
    )
  },
  address: { 
    order: 7, 
    label: 'Location',
    render: (value) => (
      <div className="text-xs">
        <div className="text-gray-300">{value.city}</div>
        <div className="text-gray-500">{value.country}</div>
      </div>
    )
  }
};

const meta: Meta<typeof UniRender> = {
  title: 'Components/UniRender',
  component: UniRender,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded', // 改为 padded 以添加边距
    docs: {
      description: {
        component: 'Universal data rendering component with multiple layout options'
      }
    }
  },
  decorators: [
    (Story) => (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <Story />
        </div>
      </div>
    )
  ],
  argTypes: {
    layout: {
      control: 'select',
      options: ['table', 'card', 'grid', 'list', 'form', 'dashboard'] as LayoutType[],
      description: 'Layout type for rendering data'
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state'
    },
    error: {
      control: 'text',
      description: 'Error message to display'
    }
  }
};

export default meta;
type Story = StoryObj<typeof UniRender>;

// Basic table layout
export const TableLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'table',
    config: userFieldConfig
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

// Card layout with rich data
export const CardLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'card',
    config: userFieldConfig
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

// Grid layout for compact display
export const GridLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'grid',
    config: userFieldConfig
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

// List layout for browsing
export const ListLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'list',
    config: userFieldConfig
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

// Form layout for detailed view
export const FormLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'form',
    config: userFieldConfig
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

// Dashboard layout with analytics
export const DashboardLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'dashboard',
    config: userFieldConfig
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

// Product data examples
export const ProductTable: Story = {
  args: {
    entity: productEntity,
    data: productData,
    layout: 'table'
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

export const ProductCards: Story = {
  args: {
    entity: productEntity,
    data: productData,
    layout: 'card'
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

// Loading state
export const LoadingState: Story = {
  args: {
    entity: userEntity,
    data: [],
    layout: 'table',
    loading: true
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

// Error state
export const ErrorState: Story = {
  args: {
    entity: userEntity,
    data: [],
    layout: 'table',
    error: 'Failed to load data from server'
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

// Empty state
export const EmptyState: Story = {
  args: {
    entity: userEntity,
    data: [],
    layout: 'table'
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
};

// Editable table with actions
export const EditableTable: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'table',
    config: userFieldConfig,
    generalConfig: {
      showActions: true,
      actions: {
        edit: true,
        delete: true
      }
    },
    onEdit: (record: any, index: number) => {
      console.log('Edit:', record, index);
    },
    onDelete: (record: any, index: number) => {
      console.log('Delete:', record, index);
    }
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: 'shown'
      }
    }
  }
}; 
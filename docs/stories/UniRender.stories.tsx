import type { Meta, StoryObj } from '@storybook/react';
import { UniRender, Entity, FieldConfig, LayoutType } from '@unilab/unify-ui';

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
    { name: 'address', type: 'object' },
    { name: 'tags', type: 'object' }
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
    address: { city: 'New York', country: 'USA' },
    tags: ['developer', 'frontend', 'react']
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 30,
    isActive: false,
    createdAt: '2024-01-10T09:15:00Z',
    address: { city: 'London', country: 'UK' },
    tags: ['designer', 'ui', 'ux']
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    age: 17,
    isActive: true,
    createdAt: '2024-01-20T14:45:00Z',
    address: { city: 'Tokyo', country: 'Japan' },
    tags: ['student', 'beginner']
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

// Custom field configurations
const userFieldConfig: Record<string, FieldConfig> = {
  id: { 
    order: 1, 
    label: 'User ID', 
    width: '80px', 
    align: 'center' 
  },
  name: { 
    order: 2, 
    label: 'Full Name', 
    width: '200px' 
  },
  email: { 
    order: 3, 
    label: 'Email Address' 
  },
  age: { 
    order: 4, 
    label: 'Age', 
    align: 'center' 
  },
  isActive: { 
    order: 5, 
    label: 'Status', 
    align: 'center' 
  }
};

const meta: Meta<typeof UniRender> = {
  title: 'Components/UniRender',
  component: UniRender,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Universal data rendering component with multiple layout options'
      }
    }
  },
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
  }
};

// Card layout with rich data
export const CardLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'card',
    config: userFieldConfig
  }
};

// Grid layout for compact display
export const GridLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'grid',
    config: userFieldConfig
  }
};

// List layout for browsing
export const ListLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'list',
    config: userFieldConfig
  }
};

// Form layout for detailed view
export const FormLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'form',
    config: userFieldConfig
  }
};

// Dashboard layout with analytics
export const DashboardLayout: Story = {
  args: {
    entity: userEntity,
    data: userData,
    layout: 'dashboard',
    config: userFieldConfig
  }
};

// Product data examples
export const ProductTable: Story = {
  args: {
    entity: productEntity,
    data: productData,
    layout: 'table'
  }
};

export const ProductCards: Story = {
  args: {
    entity: productEntity,
    data: productData,
    layout: 'card'
  }
};

// Loading state
export const LoadingState: Story = {
  args: {
    entity: userEntity,
    data: [],
    layout: 'table',
    loading: true
  }
};

// Error state
export const ErrorState: Story = {
  args: {
    entity: userEntity,
    data: [],
    layout: 'table',
    error: 'Failed to load data from server'
  }
};

// Empty state
export const EmptyState: Story = {
  args: {
    entity: userEntity,
    data: [],
    layout: 'table'
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
  }
}; 
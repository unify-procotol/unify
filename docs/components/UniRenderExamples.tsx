"use client";

import { UniRender } from "@unilab/unify-ui";
import type { UniRenderProps } from "@unilab/unify-ui";
import { useState } from "react";

interface ExampleProps {
  type: 'basic' | 'table-editable' | 'card' | 'form' | 'loading' | 'error' | 'empty';
}

export function UniRenderExample({ type }: ExampleProps) {
  // State for editable table example
  const [tableData, setTableData] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', isActive: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', isActive: true },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', isActive: false }
  ]);

  const handleEdit = async (updatedRecord: any, index: number) => {
    const newData = [...tableData];
    newData[index] = updatedRecord;
    setTableData(newData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Updated record:', updatedRecord);
  };

  const handleDelete = async (record: any, index: number) => {
    const newData = tableData.filter((_, i) => i !== index);
    setTableData(newData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Deleted record:', record);
  };

  const examples = {
    basic: {
      entity: {
        name: 'User',
        fields: [
          { name: 'id', type: 'number', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'role', type: 'string' },
          { name: 'isActive', type: 'boolean' }
        ]
      },
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', isActive: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', isActive: true },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', isActive: false }
      ],
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
      entity: {
        name: 'User',
        fields: [
          { name: 'id', type: 'number', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'role', type: 'string' },
          { name: 'isActive', type: 'boolean' }
        ]
      },
      data: tableData,
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
      entity: {
        name: 'Product',
        fields: [
          { name: 'id', type: 'number', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'price', type: 'number', required: true },
          { name: 'category', type: 'string' },
          { name: 'inStock', type: 'boolean' },
          { name: 'description', type: 'string' }
        ]
      },
      data: [
        { 
          id: 1, 
          name: 'Wireless Headphones', 
          price: 199.99, 
          category: 'Electronics', 
          inStock: true, 
          description: 'High-quality wireless headphones with noise cancellation' 
        },
        { 
          id: 2, 
          name: 'Smart Watch', 
          price: 299.99, 
          category: 'Electronics', 
          inStock: false, 
          description: 'Feature-rich smartwatch with health tracking' 
        },
        { 
          id: 3, 
          name: 'Coffee Maker', 
          price: 149.99, 
          category: 'Home', 
          inStock: true, 
          description: 'Programmable coffee maker with thermal carafe' 
        }
      ],
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
      entity: {
        name: 'User Profile',
        fields: [
          { name: 'id', type: 'number', required: true },
          { name: 'firstName', type: 'string', required: true },
          { name: 'lastName', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'phone', type: 'string' },
          { name: 'department', type: 'string' },
          { name: 'joinDate', type: 'date' },
          { name: 'isManager', type: 'boolean' }
        ]
      },
      data: [
        { 
          id: 1, 
          firstName: 'Alice', 
          lastName: 'Johnson', 
          email: 'alice.johnson@company.com', 
          phone: '+1-555-0123',
          department: 'Engineering',
          joinDate: '2023-01-15',
          isManager: true
        },
        { 
          id: 2, 
          firstName: 'Bob', 
          lastName: 'Smith', 
          email: 'bob.smith@company.com', 
          phone: '+1-555-0124',
          department: 'Marketing',
          joinDate: '2023-03-20',
          isManager: false
        }
      ],
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
    loading: {
      entity: {
        name: 'Posts',
        fields: [
          { name: 'id', type: 'number', required: true },
          { name: 'title', type: 'string', required: true },
          { name: 'content', type: 'string' },
          { name: 'author', type: 'string' },
          { name: 'publishedAt', type: 'date' }
        ]
      },
      data: [],
      layout: 'table' as const,
      loading: true
    },
    error: {
      entity: {
        name: 'Orders',
        fields: [
          { name: 'id', type: 'number', required: true },
          { name: 'customer', type: 'string', required: true },
          { name: 'total', type: 'number' },
          { name: 'status', type: 'string' },
          { name: 'orderDate', type: 'date' }
        ]
      },
      data: [],
      layout: 'table' as const,
      loading: false,
      error: "Failed to load orders: Network connection timeout"
    },
    empty: {
      entity: {
        name: 'Messages',
        fields: [
          { name: 'id', type: 'number', required: true },
          { name: 'subject', type: 'string', required: true },
          { name: 'sender', type: 'string' },
          { name: 'content', type: 'string' },
          { name: 'receivedAt', type: 'date' }
        ]
      },
      data: [],
      layout: 'table' as const,
      loading: false,
      error: null
    }
  };

  const props = examples[type] as UniRenderProps;
  
  return <UniRender {...props} />;
} 
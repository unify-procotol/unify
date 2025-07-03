import React from 'react';
import { UniRender, Entity, FieldConfig } from '@unify/ui';

// Example usage of UniRender component
export const UniRenderExample = () => {
  // Sample entity definition
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

  // Field configuration with custom rendering and ordering
  const fieldConfig: Record<string, FieldConfig> = {
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

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-200 mb-2">UniRender Component Examples</h1>
        <p className="text-gray-400">Showcase of different layout modes and configurations</p>
      </div>

      {/* Table Layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-300">Table Layout</h2>
        <UniRender
          entity={userEntity}
          data={userData}
          layout="table"
          config={fieldConfig}
        />
      </div>

      {/* Card Layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-300">Card Layout</h2>
        <UniRender
          entity={userEntity}
          data={userData}
          layout="card"
          config={fieldConfig}
        />
      </div>

      {/* Grid Layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-300">Grid Layout</h2>
        <UniRender
          entity={userEntity}
          data={userData}
          layout="grid"
          config={fieldConfig}
        />
      </div>

      {/* List Layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-300">List Layout</h2>
        <UniRender
          entity={userEntity}
          data={userData}
          layout="list"
          config={fieldConfig}
        />
      </div>

      {/* Form Layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-300">Form Layout</h2>
        <UniRender
          entity={userEntity}
          data={userData}
          layout="form"
          config={fieldConfig}
        />
      </div>

      {/* Dashboard Layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-300">Dashboard Layout</h2>
        <UniRender
          entity={userEntity}
          data={userData}
          layout="dashboard"
          config={fieldConfig}
        />
      </div>

      {/* Usage Examples */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-gray-300 mb-4">Usage Examples</h2>
        
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">Basic Usage</h3>
            <pre className="bg-gray-800 rounded p-4 text-green-400 text-xs overflow-x-auto">
{`<UniRender
  entity={userEntity}
  data={userData}
  layout="table"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">With Field Configuration</h3>
            <pre className="bg-gray-800 rounded p-4 text-green-400 text-xs overflow-x-auto">
{`<UniRender
  entity={userEntity}
  data={userData}
  layout="card"
  config={{
    name: { order: 1, label: 'Full Name' },
    email: { 
      order: 2, 
      render: (value) => <a href={\`mailto:\${value}\`}>{value}</a> 
    },
    age: { 
      order: 3, 
      hidden: true  // Hide this field
    }
  }}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">With Loading State</h3>
            <pre className="bg-gray-800 rounded p-4 text-green-400 text-xs overflow-x-auto">
{`<UniRender
  entity={userEntity}
  data={[]}
  layout="table"
  loading={true}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">With Error State</h3>
            <pre className="bg-gray-800 rounded p-4 text-green-400 text-xs overflow-x-auto">
{`<UniRender
  entity={userEntity}
  data={[]}
  layout="table"
  error="Failed to load data"
/>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Field Config Options */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-gray-300 mb-4">Field Configuration Options</h2>
        
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">Basic Options</h3>
            <ul className="space-y-2 text-gray-300">
              <li><code className="text-green-400">order</code>: Number - Field display order</li>
              <li><code className="text-green-400">label</code>: String - Custom field label</li>
              <li><code className="text-green-400">hidden</code>: Boolean - Hide field</li>
              <li><code className="text-green-400">width</code>: String/Number - Column width</li>
              <li><code className="text-green-400">align</code>: 'left'|'center'|'right' - Text alignment</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">Advanced Options</h3>
            <ul className="space-y-2 text-gray-300">
              <li><code className="text-green-400">render</code>: Function - Custom render function</li>
              <li><code className="text-green-400">editable</code>: Boolean - Field is editable</li>
              <li><code className="text-green-400">required</code>: Boolean - Field is required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniRenderExample; 
import React, { useState } from 'react';
import { UniRender, Entity, FieldConfig, LayoutType, GeneralConfig } from './uniRender';

// Sample entities for different use cases
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
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    age: 28,
    isActive: true,
    createdAt: '2024-01-12T16:20:00Z',
    address: { city: 'Paris', country: 'France' },
    tags: ['manager', 'leadership']
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

// Field configurations
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
  },
  tags: { 
    order: 8, 
    label: 'Tags',
    render: (value) => (
      <div className="flex flex-wrap gap-1">
        {value.map((tag: string, index: number) => (
          <span key={index} className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>
    )
  }
};

const productFieldConfig: Record<string, FieldConfig> = {
  id: { 
    order: 1, 
    label: 'ID', 
    width: '60px', 
    align: 'center' 
  },
  name: { 
    order: 2, 
    label: 'Product Name',
    render: (value) => (
      <span className="font-semibold text-gray-200">{value}</span>
    )
  },
  price: { 
    order: 3, 
    label: 'Price', 
    align: 'right',
    render: (value) => (
      <span className="text-green-400 font-mono">
        ${value.toLocaleString()}
      </span>
    )
  },
  category: { 
    order: 4, 
    label: 'Category',
    render: (value) => (
      <span className="px-2 py-1 bg-gray-600/20 text-gray-300 rounded text-xs">
        {value}
      </span>
    )
  },
  inStock: { 
    order: 5, 
    label: 'Stock', 
    align: 'center',
    render: (value) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        value 
          ? 'bg-green-600/20 text-green-400' 
          : 'bg-red-600/20 text-red-400'
      }`}>
        {value ? '✓ In Stock' : '✗ Out of Stock'}
      </span>
    )
  },
  rating: { 
    order: 6, 
    label: 'Rating', 
    align: 'center',
    render: (value) => (
      <div className="flex items-center space-x-1">
        <span className="text-yellow-400">★</span>
        <span className="text-gray-300">{value}</span>
      </div>
    )
  },
  description: { 
    order: 7, 
    label: 'Description',
    render: (value) => (
      <span className="text-gray-400 text-sm">{value}</span>
    )
  }
};

// Story definitions
const stories = [
  {
    id: 'user-table',
    title: 'User Table',
    description: 'Basic table layout with user data',
    entity: userEntity,
    data: userData,
    layout: 'table' as LayoutType,
    config: userFieldConfig
  },
  {
    id: 'user-table-editable',
    title: 'User Table (Editable)',
    description: 'Table layout with edit and delete actions',
    entity: userEntity,
    data: userData,
    layout: 'table' as LayoutType,
    config: userFieldConfig,
    generalConfig: {
      showActions: true,
      actions: {
        edit: true,
        delete: true,
        custom: [
          {
            label: 'View Profile',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            ),
            onClick: (record: any) => alert(`Viewing profile for ${record.name}`),
            className: "p-1 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded transition-colors"
          }
        ]
      }
    }
  },
  {
    id: 'user-card',
    title: 'User Cards',
    description: 'Card layout showing user information',
    entity: userEntity,
    data: userData,
    layout: 'card' as LayoutType,
    config: userFieldConfig
  },
  {
    id: 'user-grid',
    title: 'User Grid',
    description: 'Grid layout for compact user display',
    entity: userEntity,
    data: userData,
    layout: 'grid' as LayoutType,
    config: userFieldConfig
  },
  {
    id: 'user-list',
    title: 'User List',
    description: 'List layout for user browsing',
    entity: userEntity,
    data: userData,
    layout: 'list' as LayoutType,
    config: userFieldConfig
  },
  {
    id: 'user-form',
    title: 'User Form',
    description: 'Form layout for detailed user view',
    entity: userEntity,
    data: userData,
    layout: 'form' as LayoutType,
    config: userFieldConfig
  },
  {
    id: 'user-form-editable',
    title: 'User Form (Editable)',
    description: 'Form layout with edit capability',
    entity: userEntity,
    data: userData,
    layout: 'form' as LayoutType,
    config: userFieldConfig,
    generalConfig: {
      editable: true
    }
  },
  {
    id: 'user-dashboard',
    title: 'User Dashboard',
    description: 'Dashboard layout with user analytics',
    entity: userEntity,
    data: userData,
    layout: 'dashboard' as LayoutType,
    config: userFieldConfig
  },
  {
    id: 'product-table',
    title: 'Product Table',
    description: 'Product catalog in table format',
    entity: productEntity,
    data: productData,
    layout: 'table' as LayoutType,
    config: productFieldConfig
  },
  {
    id: 'product-card',
    title: 'Product Cards',
    description: 'Product showcase in card format',
    entity: productEntity,
    data: productData,
    layout: 'card' as LayoutType,
    config: productFieldConfig
  },
  {
    id: 'loading-state',
    title: 'Loading State',
    description: 'Component in loading state',
    entity: userEntity,
    data: [],
    layout: 'table' as LayoutType,
    config: userFieldConfig,
    loading: true
  },
  {
    id: 'error-state',
    title: 'Error State',
    description: 'Component with error message',
    entity: userEntity,
    data: [],
    layout: 'table' as LayoutType,
    config: userFieldConfig,
    error: 'Failed to load data from server'
  },
  {
    id: 'empty-state',
    title: 'Empty State',
    description: 'Component with no data',
    entity: userEntity,
    data: [],
    layout: 'table' as LayoutType,
    config: userFieldConfig
  }
];

export const StoryPage: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState(stories[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [storyData, setStoryData] = useState(userData); // Track data changes

  // Simulate API calls with delays
  const handleEdit = async (record: any, index: number) => {
    console.log('Editing record:', record, 'at index:', index);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update local data
    const newData = [...storyData];
    newData[index] = record;
    setStoryData(newData);
    
    alert(`Successfully updated ${record.name || `record ${index + 1}`}!`);
  };

  const handleDelete = async (record: any, index: number) => {
    console.log('Deleting record:', record, 'at index:', index);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update local data
    const newData = storyData.filter((_, i) => i !== index);
    setStoryData(newData);
    
    alert(`Successfully deleted ${record.name || `record ${index + 1}`}!`);
  };

  const handleSave = async (record: any, index: number) => {
    console.log('Saving record:', record, 'at index:', index);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update local data
    const newData = [...storyData];
    newData[index] = record;
    setStoryData(newData);
    
    alert(`Successfully saved ${record.name || `record ${index + 1}`}!`);
  };

  // Get current data for the story
  const getCurrentData = () => {
    if (selectedStory.id.includes('user')) {
      return storyData;
    }
    return selectedStory.data;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="h-16 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700/50 flex items-center justify-between px-4 shadow-lg">
          <div className={`flex items-center space-x-3 ${!sidebarOpen && 'hidden'}`}>
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">US</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">UniRender</h1>
              <p className="text-xs text-gray-400 font-medium">Storybook Studio</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        {/* Story List */}
        <div className="flex-1 overflow-y-auto">
          {sidebarOpen ? (
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L8 4z"/>
                  </svg>
                </div>
                <div className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Stories</div>
              </div>
              
              {/* Group stories by category */}
              <div className="space-y-6">
                {/* User Stories */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">User Entity</div>
                  </div>
                  <div className="space-y-1 ml-6">
                    {stories.filter(story => story.id.includes('user')).map((story) => (
                      <button
                        key={story.id}
                        onClick={() => setSelectedStory(story)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                          selectedStory.id === story.id
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 transform scale-[1.02]'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:transform hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">{story.title}</div>
                            <div className={`text-xs leading-relaxed ${
                              selectedStory.id === story.id ? 'text-orange-100' : 'text-gray-400 group-hover:text-gray-300'
                            }`}>
                              {story.description}
                            </div>
                          </div>
                          {selectedStory.id === story.id && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              selectedStory.id === story.id
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-700/50 text-gray-300 group-hover:bg-gray-600'
                            }`}>
                              {story.layout}
                            </span>
                            <span className={`text-xs ${
                              selectedStory.id === story.id ? 'text-orange-200' : 'text-gray-500 group-hover:text-gray-400'
                            }`}>
                              {story.data.length} records
                            </span>
                          </div>
                          {story.id.includes('editable') && (
                            <div className="flex items-center space-x-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                selectedStory.id === story.id ? 'bg-green-300' : 'bg-green-500'
                              }`}></div>
                              <span className={`text-xs ${
                                selectedStory.id === story.id ? 'text-green-200' : 'text-green-400'
                              }`}>
                                Interactive
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Stories */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                    </div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Product Entity</div>
                  </div>
                  <div className="space-y-1 ml-6">
                    {stories.filter(story => story.id.includes('product')).map((story) => (
                      <button
                        key={story.id}
                        onClick={() => setSelectedStory(story)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                          selectedStory.id === story.id
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 transform scale-[1.02]'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:transform hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">{story.title}</div>
                            <div className={`text-xs leading-relaxed ${
                              selectedStory.id === story.id ? 'text-orange-100' : 'text-gray-400 group-hover:text-gray-300'
                            }`}>
                              {story.description}
                            </div>
                          </div>
                          {selectedStory.id === story.id && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              selectedStory.id === story.id
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-700/50 text-gray-300 group-hover:bg-gray-600'
                            }`}>
                              {story.layout}
                            </span>
                            <span className={`text-xs ${
                              selectedStory.id === story.id ? 'text-orange-200' : 'text-gray-500 group-hover:text-gray-400'
                            }`}>
                              {story.data.length} records
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special States */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Special States</div>
                  </div>
                  <div className="space-y-1 ml-6">
                    {stories.filter(story => story.id.includes('loading') || story.id.includes('error') || story.id.includes('empty')).map((story) => (
                      <button
                        key={story.id}
                        onClick={() => setSelectedStory(story)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                          selectedStory.id === story.id
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 transform scale-[1.02]'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:transform hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">{story.title}</div>
                            <div className={`text-xs leading-relaxed ${
                              selectedStory.id === story.id ? 'text-orange-100' : 'text-gray-400 group-hover:text-gray-300'
                            }`}>
                              {story.description}
                            </div>
                          </div>
                          {selectedStory.id === story.id && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              selectedStory.id === story.id
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-700/50 text-gray-300 group-hover:bg-gray-600'
                            }`}>
                              {story.layout}
                            </span>
                            {story.loading && (
                              <div className="flex items-center space-x-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  selectedStory.id === story.id ? 'bg-yellow-300' : 'bg-yellow-500'
                                } animate-pulse`}></div>
                                <span className={`text-xs ${
                                  selectedStory.id === story.id ? 'text-yellow-200' : 'text-yellow-400'
                                }`}>
                                  Loading
                                </span>
                              </div>
                            )}
                            {story.error && (
                              <div className="flex items-center space-x-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  selectedStory.id === story.id ? 'bg-red-300' : 'bg-red-500'
                                }`}></div>
                                <span className={`text-xs ${
                                  selectedStory.id === story.id ? 'text-red-200' : 'text-red-400'
                                }`}>
                                  Error
                                </span>
                              </div>
                            )}
                            {story.data.length === 0 && !story.loading && !story.error && (
                              <div className="flex items-center space-x-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  selectedStory.id === story.id ? 'bg-gray-300' : 'bg-gray-500'
                                }`}></div>
                                <span className={`text-xs ${
                                  selectedStory.id === story.id ? 'text-gray-200' : 'text-gray-400'
                                }`}>
                                  Empty
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed sidebar indicators */
            <div className="p-2 space-y-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-200">{selectedStory.title}</h2>
            <p className="text-sm text-gray-400">{selectedStory.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Layout: <span className="text-orange-400 font-medium">{selectedStory.layout}</span>
            </div>
            <div className="text-sm text-gray-500">
              Records: <span className="text-gray-300">{selectedStory.data.length}</span>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="flex-1 overflow-auto p-6" style={{ maxHeight: 'calc(100vh - 16rem - 180px)' }}>
          <div className="max-w-7xl mx-auto">
            <UniRender
              entity={selectedStory.entity}
              data={getCurrentData()}
              layout={selectedStory.layout}
              config={selectedStory.config}
              generalConfig={selectedStory.generalConfig}
              loading={selectedStory.loading}
              error={selectedStory.error}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSave={handleSave}
            />
          </div>
        </div>

        {/* Code Preview - Fixed Height */}
        <div className="h-44 bg-gray-900 border-t border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-300">Code Preview</div>
            <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors">
              Copy Code
            </button>
          </div>
          <pre className="bg-gray-800 rounded p-3 text-xs text-green-400 overflow-auto h-32">
{`<UniRender
  entity={${selectedStory.entity.name.toLowerCase()}}
  data={${selectedStory.data.length > 0 ? `${selectedStory.entity.name.toLowerCase()}Data` : '[]'}}
  layout="${selectedStory.layout}"${selectedStory.config ? `
  config={${selectedStory.entity.name.toLowerCase()}FieldConfig}` : ''}${selectedStory.loading ? `
  loading={true}` : ''}${selectedStory.error ? `
  error="${selectedStory.error}"` : ''}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default StoryPage; 
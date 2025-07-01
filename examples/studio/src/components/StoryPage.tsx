import React, { useState } from 'react';
import { UniRender, Entity, FieldConfig, LayoutType, GeneralConfig } from './uniRender';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

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
      <Badge variant="outline" className="text-xs font-mono">
        #{value}
      </Badge>
    )
  },
  name: { 
    order: 2, 
    label: 'Full Name', 
    width: '200px',
    render: (value) => (
      <span className="font-semibold text-foreground">{value}</span>
    )
  },
  email: { 
    order: 3, 
    label: 'Email Address',
    render: (value) => (
      <a href={`mailto:${value}`} className="text-primary hover:underline">
        {value}
      </a>
    )
  },
  age: { 
    order: 4, 
    label: 'Age', 
    align: 'center',
    render: (value) => (
      <Badge 
        variant={value >= 18 ? "secondary" : "outline"}
        className={cn(
          "text-xs font-semibold",
          value >= 18 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-yellow-600 dark:text-yellow-400'
        )}
      >
        {value} {value >= 18 ? '(Adult)' : '(Minor)'}
      </Badge>
    )
  },
  isActive: { 
    order: 5, 
    label: 'Status', 
    align: 'center',
    render: (value) => (
      <Badge 
        variant={value ? "secondary" : "destructive"}
        className="text-xs font-semibold"
      >
        {value ? '● Active' : '● Inactive'}
      </Badge>
    )
  },
  createdAt: { 
    order: 6, 
    label: 'Created Date',
    render: (value) => (
      <div className="text-xs">
        <div className="text-primary font-mono">
          {new Date(value).toLocaleDateString()}
        </div>
        <div className="text-muted-foreground">
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
        <div className="text-foreground">{value.city}</div>
        <div className="text-muted-foreground">{value.country}</div>
      </div>
    )
  },
  tags: { 
    order: 8, 
    label: 'Tags',
    render: (value) => (
      <div className="flex flex-wrap gap-1">
        {value.map((tag: string, index: number) => (
          <Badge key={index} variant="outline" className="text-xs">
            {tag}
          </Badge>
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
      <span className="font-semibold text-foreground">{value}</span>
    )
  },
  price: { 
    order: 3, 
    label: 'Price', 
    align: 'right',
    render: (value) => (
      <span className="text-green-600 dark:text-green-400 font-mono">
        ${value.toLocaleString()}
      </span>
    )
  },
  category: { 
    order: 4, 
    label: 'Category',
    render: (value) => (
      <Badge variant="secondary" className="text-xs">
        {value}
      </Badge>
    )
  },
  inStock: { 
    order: 5, 
    label: 'Stock', 
    align: 'center',
    render: (value) => (
      <Badge 
        variant={value ? "secondary" : "destructive"}
        className="text-xs font-semibold"
      >
        {value ? '✓ In Stock' : '✗ Out of Stock'}
      </Badge>
    )
  },
  rating: { 
    order: 6, 
    label: 'Rating', 
    align: 'center',
    render: (value) => (
      <div className="flex items-center space-x-1">
        <span className="text-yellow-500 dark:text-yellow-400">★</span>
        <span className="text-foreground">{value}</span>
      </div>
    )
  },
  description: { 
    order: 7, 
    label: 'Description',
    render: (value) => (
      <span className="text-muted-foreground text-sm">{value}</span>
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
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <div className={cn(
        "border-r border-border transition-all duration-300 flex flex-col",
        sidebarOpen ? 'w-80' : 'w-16'
      )}>
        {/* Header */}
        <Card className="h-16 rounded-none border-x-0 border-t-0 flex items-center justify-between px-4">
          <div className={cn("flex items-center space-x-3", !sidebarOpen && 'hidden')}>
            <div className="relative">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-sm">US</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">UniRender</h1>
              <p className="text-xs text-muted-foreground font-medium">Storybook Studio</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
            </svg>
          </Button>
        </Card>

        {/* Story List */}
        <div className="flex-1 overflow-y-auto">
          {sidebarOpen ? (
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L8 4z"/>
                  </svg>
                </div>
                <div className="text-sm font-semibold text-foreground uppercase tracking-wider">Stories</div>
              </div>
              
              {/* Group stories by category */}
              <div className="space-y-6">
                {/* User Stories */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="secondary" className="w-4 h-4 p-0 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </Badge>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User Entity</div>
                  </div>
                  <div className="space-y-1 ml-6">
                    {stories.filter(story => story.id.includes('user')).map((story) => (
                      <Card 
                        key={story.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          selectedStory.id === story.id 
                            ? "border-primary bg-primary/5 shadow-lg" 
                            : "hover:bg-muted/30"
                        )}
                        onClick={() => setSelectedStory(story)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm mb-1 text-foreground">{story.title}</div>
                              <div className="text-xs leading-relaxed text-muted-foreground">
                                {story.description}
                              </div>
                            </div>
                            {selectedStory.id === story.id && (
                              <div className="flex-shrink-0 ml-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {story.layout}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {story.data.length} records
                              </span>
                            </div>
                            {story.id.includes('editable') && (
                              <div className="flex items-center space-x-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  Interactive
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
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
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Entity</div>
                  </div>
                  <div className="space-y-1 ml-6">
                    {stories.filter(story => story.id.includes('product')).map((story) => (
                      <Card 
                        key={story.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          selectedStory.id === story.id 
                            ? "border-primary bg-primary/5 shadow-lg" 
                            : "hover:bg-muted/30"
                        )}
                        onClick={() => setSelectedStory(story)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm mb-1 text-foreground">{story.title}</div>
                              <div className="text-xs leading-relaxed text-muted-foreground">
                                {story.description}
                              </div>
                            </div>
                            {selectedStory.id === story.id && (
                              <div className="flex-shrink-0 ml-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {story.layout}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {story.data.length} records
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Special States</div>
                  </div>
                  <div className="space-y-1 ml-6">
                    {stories.filter(story => story.id.includes('loading') || story.id.includes('error') || story.id.includes('empty')).map((story) => (
                      <Card 
                        key={story.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          selectedStory.id === story.id 
                            ? "border-primary bg-primary/5 shadow-lg" 
                            : "hover:bg-muted/30"
                        )}
                        onClick={() => setSelectedStory(story)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm mb-1 text-foreground">{story.title}</div>
                              <div className="text-xs leading-relaxed text-muted-foreground">
                                {story.description}
                              </div>
                            </div>
                            {selectedStory.id === story.id && (
                              <div className="flex-shrink-0 ml-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {story.layout}
                              </Badge>
                              {story.loading && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                    Loading
                                  </span>
                                </div>
                              )}
                              {story.error && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>
                                  <span className="text-xs text-destructive">
                                    Error
                                  </span>
                                </div>
                              )}
                              {story.data.length === 0 && !story.loading && !story.error && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                                  <span className="text-xs text-muted-foreground">
                                    Empty
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed sidebar indicators */
            <div className="p-2 space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <Card className="h-16 rounded-none border-x-0 border-t-0 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{selectedStory.title}</h2>
            <p className="text-sm text-muted-foreground">{selectedStory.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Layout: <Badge variant="secondary" className="ml-1">{selectedStory.layout}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Records: <span className="text-foreground font-medium">{selectedStory.data.length}</span>
            </div>
          </div>
        </Card>

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
        <Card className="h-44 rounded-none border-x-0 border-b-0 p-4 flex-shrink-0">
          <CardHeader className="p-0 mb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">Code Preview</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-3 text-xs"
                onClick={() => {
                  const code = `<UniRender
  entity={${selectedStory.entity.name.toLowerCase()}}
  data={${selectedStory.data.length > 0 ? `${selectedStory.entity.name.toLowerCase()}Data` : '[]'}}
  layout="${selectedStory.layout}"${selectedStory.config ? `
  config={${selectedStory.entity.name.toLowerCase()}FieldConfig}` : ''}${selectedStory.loading ? `
  loading={true}` : ''}${selectedStory.error ? `
  error="${selectedStory.error}"` : ''}
/>`;
                  navigator.clipboard.writeText(code);
                }}
              >
                Copy Code
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Card className="bg-muted/30 border-muted">
              <CardContent className="p-3">
                <pre className="text-xs text-foreground overflow-auto h-28 font-mono leading-relaxed">
{`<UniRender
  entity={${selectedStory.entity.name.toLowerCase()}}
  data={${selectedStory.data.length > 0 ? `${selectedStory.entity.name.toLowerCase()}Data` : '[]'}}
  layout="${selectedStory.layout}"${selectedStory.config ? `
  config={${selectedStory.entity.name.toLowerCase()}FieldConfig}` : ''}${selectedStory.loading ? `
  loading={true}` : ''}${selectedStory.error ? `
  error="${selectedStory.error}"` : ''}
/>`}
                </pre>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoryPage; 
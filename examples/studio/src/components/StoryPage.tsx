import React, { useState } from 'react';
import { UniRender, Entity, FieldConfig, LayoutType } from '@unilab/unify-ui';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

// Simple user entity for demonstration
const userEntity: Entity = {
  name: 'UserEntity',
  fields: [
    { name: 'id', type: 'number', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'age', type: 'number' },
    { name: 'isActive', type: 'boolean' },
    { name: 'createdAt', type: 'date' }
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
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 30,
    isActive: false,
    createdAt: '2024-01-10T09:15:00Z'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    age: 17,
    isActive: true,
    createdAt: '2024-01-20T14:45:00Z'
  }
];

// Field configuration
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

export const StoryPage: React.FC = () => {
  const [layout, setLayout] = useState<LayoutType>('table');

  const layouts: LayoutType[] = ['table', 'card', 'grid', 'list', 'form', 'dashboard'];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">UniRender Demo</CardTitle>
              <p className="text-muted-foreground mt-2">
                A simple demonstration of the UniRender component with different layouts
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Layout:</span>
              <div className="flex space-x-1">
                {layouts.map((layoutOption) => (
                  <Button
                    key={layoutOption}
                    variant={layout === layoutOption ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLayout(layoutOption)}
                    className="capitalize"
                  >
                    {layoutOption}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Currently showing: <Badge variant="secondary">{layout}</Badge> layout
              </div>
              <div className="text-sm text-muted-foreground">
                Records: <span className="font-medium">{userData.length}</span>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/30">
              <UniRender
                entity={userEntity}
                data={userData}
                layout={layout}
                config={userFieldConfig}
                generalConfig={{
                  showActions: layout === 'table',
                  actions: {
                    edit: true,
                    delete: true
                  }
                }}
                onEdit={(record: any, index: number) => {
                  console.log('Edit:', record, index);
                  alert(`Editing ${record.name}`);
                }}
                onDelete={(record: any, index: number) => {
                  console.log('Delete:', record, index);
                  alert(`Deleting ${record.name}`);
                }}
              />
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>
                For complete documentation and advanced features, check out the{' '}
                <a href="/docs" className="text-primary hover:underline">
                  Storybook documentation
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryPage; 
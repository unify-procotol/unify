import React from 'react';
import { Button } from '../ui/button';
import { Database, Plus } from 'lucide-react';
import { Entity } from '../../types';

interface EmptyStateProps {
  entity: Entity;
  showTopControls?: boolean;
  showAddButton?: boolean;
  onAddRecord?: (record: any) => Promise<void>;
  handleAddRecord: () => void;
  viewName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  entity,
  showTopControls = true,
  showAddButton = true,
  onAddRecord,
  handleAddRecord,
  viewName = 'records'
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{entity.name || 'Records'}</h2>
          <p className="text-muted-foreground">
            {viewName} view for {entity.name?.toLowerCase() || 'records'}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          <Database className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No records found</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          There are no {entity.name?.toLowerCase() || 'records'} to display in {viewName} view.
        </p>
        
        {/* Show add button if showAddButton is true and handleAddRecord is available */}
        {showAddButton && (
          <Button
            onClick={handleAddRecord}
            className="bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Record
          </Button>
        )}
      </div>
    </div>
  );
}; 
import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Entity } from '../../types';

interface LayoutHeaderProps {
  entity: Entity;
  data: any[];
  showTopControls?: boolean;
  showAddButton?: boolean;
  onAddRecord?: (record: any) => Promise<void>;
  handleAddRecord: () => void;
  viewName?: string;
  title?: string;
  description?: string;
}

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({
  entity,
  data,
  showTopControls = true,
  showAddButton = true,
  onAddRecord,
  handleAddRecord,
  viewName = 'records',
  title,
  description
}) => {
  if (!showTopControls) return null;

  const defaultTitle = title || entity.name;
  const defaultDescription = description || 
    `${data.length} record${data.length !== 1 ? 's' : ''} in ${viewName} view`;

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">{defaultTitle}</h2>
        <p className="text-muted-foreground">{defaultDescription}</p>
      </div>
      {showAddButton && onAddRecord && (
        <Button
          onClick={handleAddRecord}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      )}
    </div>
  );
}; 
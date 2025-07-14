import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Search } from 'lucide-react';
import { Entity, FieldConfig } from '../../types';
import { SimpleTableFilter, FilterConfig } from './SimpleTableFilter';

interface LayoutHeaderProps {
  entity: Entity;
  data: any[];
  config?: Record<string, FieldConfig>;
  showTopControls?: boolean;
  showAddButton?: boolean;
  onAddRecord?: (record: any) => Promise<void>;
  handleAddRecord: () => void;
  viewName?: string;
  title?: string;
  description?: string;
  // Filter props
  showFilter?: boolean;
  filterConfig?: FilterConfig;
  onFilteredDataChange?: (filteredData: any[]) => void;
}

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({
  entity,
  data,
  config,
  showTopControls = true,
  showAddButton = true,
  onAddRecord,
  handleAddRecord,
  viewName = 'records',
  title,
  description,
  showFilter = true,
  filterConfig,
  onFilteredDataChange
}) => {
  const [filteredData, setFilteredData] = useState(data);

  if (!showTopControls) return null;

  const defaultTitle = title || entity.name;
  const recordCount = filteredData.length;
  const totalCount = data.length;
  const defaultDescription = description || 
    `${recordCount}${recordCount !== totalCount ? ` of ${totalCount}` : ''} record${recordCount !== 1 ? 's' : ''}`;

  const handleFilterChange = (newFilteredData: any[]) => {
    setFilteredData(newFilteredData);
    onFilteredDataChange?.(newFilteredData);
  };

  return (
    <div className="space-y-3">
      {showFilter && (
        <SimpleTableFilter
          entity={entity}
          data={data}
          config={config}
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
          showAddButton={showAddButton}
          onAddRecord={onAddRecord}
          handleAddRecord={handleAddRecord}
        />
      )}
    </div>
  );
}; 
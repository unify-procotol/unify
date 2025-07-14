import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { 
  Search, 
  X, 
  Plus
} from 'lucide-react';
import { Entity, EntityField, FieldConfig } from '../../types';

// Filter condition type
export interface FilterCondition {
  field: string;
  operator: string;
  value: any;
}

// Filter configuration
export interface FilterConfig {
  showFieldFilter?: boolean;
  showSearch?: boolean;
  showToggle?: boolean;
  placeholder?: string;
  defaultExpanded?: boolean;
}

interface SimpleTableFilterProps {
  entity: Entity;
  data: any[];
  config?: Record<string, FieldConfig>;
  filterConfig?: FilterConfig;
  onFilterChange?: (filteredData: any[]) => void;
  onSearchChange?: (searchTerm: string) => void;
  onConditionChange?: (conditions: FilterCondition[]) => void;
  // Add Record props
  showAddButton?: boolean;
  onAddRecord?: (record: any) => Promise<void>;
  handleAddRecord?: () => void;
}

// Get operators based on field type
const getOperatorsByType = (fieldType: string): Array<{ value: string; label: string }> => {
  switch (fieldType) {
    case 'number':
    case 'integer':
      return [
        { value: 'eq', label: 'Equal to' },
        { value: 'gt', label: 'Greater than' },
        { value: 'gte', label: 'Greater than or equal' },
        { value: 'lt', label: 'Less than' },
        { value: 'lte', label: 'Less than or equal' },
        { value: 'ne', label: 'Not equal to' }
      ];
    case 'string':
    case 'email':
      return [
        { value: 'contains', label: 'Contains' },
        { value: 'eq', label: 'Equal to' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
        { value: 'ne', label: 'Not equal to' }
      ];
    case 'boolean':
      return [
        { value: 'eq', label: 'Equal to' },
        { value: 'ne', label: 'Not equal to' }
      ];
    case 'date':
      return [
        { value: 'eq', label: 'Equal to' },
        { value: 'gt', label: 'After' },
        { value: 'gte', label: 'After or equal' },
        { value: 'lt', label: 'Before' },
        { value: 'lte', label: 'Before or equal' },
        { value: 'ne', label: 'Not equal to' }
      ];
    default:
      return [
        { value: 'contains', label: 'Contains' },
        { value: 'eq', label: 'Equal to' },
        { value: 'ne', label: 'Not equal to' }
      ];
  }
};

// Apply filter conditions to data
const applyFilterConditions = (data: any[], conditions: FilterCondition[]): any[] => {
  return data.filter(record => {
    return conditions.every(condition => {
      const fieldValue = record[condition.field];
      const { operator, value } = condition;

      if (value === null || value === undefined || value === '') {
        return true; // Skip empty conditions
      }

      // Convert value for comparison if needed
      let compareValue = value;
      if (value === 'true') compareValue = true;
      if (value === 'false') compareValue = false;
      if (typeof fieldValue === 'number' && typeof value === 'string') {
        compareValue = Number(value);
      }

      switch (operator) {
        case 'eq':
          return fieldValue === compareValue;
        case 'ne':
          return fieldValue !== compareValue;
        case 'gt':
          return Number(fieldValue) > Number(value);
        case 'gte':
          return Number(fieldValue) >= Number(value);
        case 'lt':
          return Number(fieldValue) < Number(value);
        case 'lte':
          return Number(fieldValue) <= Number(value);
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
        case 'startsWith':
          return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
        case 'endsWith':
          return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
        default:
          return true;
      }
    });
  });
};

// Apply global search to data
const applyGlobalSearch = (data: any[], searchTerm: string, entity: Entity): any[] => {
  if (!searchTerm.trim()) return data;

  const searchLower = searchTerm.toLowerCase();
  return data.filter(record => {
    return entity.fields.some(field => {
      const fieldValue = record[field.name];
      if (fieldValue === null || fieldValue === undefined) return false;
      return String(fieldValue).toLowerCase().includes(searchLower);
    });
  });
};

export const SimpleTableFilter: React.FC<SimpleTableFilterProps> = ({
  entity,
  data,
  config,
  filterConfig = {},
  onFilterChange,
  onSearchChange,
  onConditionChange,
  // Add Record props
  showAddButton = true,
  onAddRecord,
  handleAddRecord
}) => {
  const {
    showFieldFilter = true,
    showSearch = true,
    showToggle = false,
    placeholder = "Search all fields...",
    defaultExpanded = true
  } = filterConfig;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('contains');
  const [filterValue, setFilterValue] = useState('');

  // Get filterable fields (exclude hidden and non-filterable fields)
  const filterableFields = useMemo(() => {
    return entity.fields.filter(field => {
      if (config?.[field.name]?.hidden) return false;
      // Exclude complex types that are hard to filter
      if (field.type === 'array' || field.type === 'object') return false;
      return true;
    });
  }, [entity.fields, config]);

  // Apply all filters and notify parent
  const applyFilters = useMemo(() => {
    let filteredData = [...data];

    // Apply field-specific filter
    if (selectedField && filterValue.trim()) {
      const condition: FilterCondition = {
        field: selectedField,
        operator: selectedOperator,
        value: filterValue
      };
      filteredData = applyFilterConditions(filteredData, [condition]);
    }

    // Apply global search
    if (searchTerm.trim()) {
      filteredData = applyGlobalSearch(filteredData, searchTerm, entity);
    }

    return filteredData;
  }, [data, selectedField, selectedOperator, filterValue, searchTerm, entity]);

  // Notify parent of filter changes
  React.useEffect(() => {
    onFilterChange?.(applyFilters);
  }, [applyFilters, onFilterChange]);

  React.useEffect(() => {
    onSearchChange?.(searchTerm);
  }, [searchTerm, onSearchChange]);

  React.useEffect(() => {
    const condition = selectedField && filterValue ? [{
      field: selectedField,
      operator: selectedOperator,
      value: filterValue
    }] : [];
    onConditionChange?.(condition);
  }, [selectedField, selectedOperator, filterValue, onConditionChange]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedField('');
    setSelectedOperator('contains');
    setFilterValue('');
    setSearchTerm('');
  };

  // Get active filters count
  const activeFiltersCount = (selectedField && filterValue.trim() ? 1 : 0) + (searchTerm.trim() ? 1 : 0);

  // Get operators for selected field
  const availableOperators = useMemo(() => {
    if (!selectedField) return [];
    const field = filterableFields.find(f => f.name === selectedField);
    return field ? getOperatorsByType(field.type) : [];
  }, [selectedField, filterableFields]);

  // Handle field change
  const handleFieldChange = (fieldName: string) => {
    setSelectedField(fieldName);
    if (fieldName) {
      const field = filterableFields.find(f => f.name === fieldName);
      if (field) {
        const operators = getOperatorsByType(field.type);
        setSelectedOperator(operators[0]?.value || 'contains');
      }
    }
    setFilterValue('');
  };

  return (
    <div className="space-y-3">
      {/* Main Header Row */}
      <div className="flex items-center gap-3">
        {/* Field Filter */}
        {showFieldFilter && (
          <div className="flex items-center gap-2">
            <select
              value={selectedField}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="flex h-9 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Select Field</option>
              {filterableFields.map(field => (
                <option key={field.name} value={field.name}>
                  {config?.[field.name]?.label || field.name}
                </option>
              ))}
            </select>

            {/* Operator Selection */}
            {selectedField && (
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {availableOperators.map(op => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            )}

            {/* Value Input */}
            {selectedField && (
              <div className="w-40">
                {filterableFields.find(f => f.name === selectedField)?.type === 'boolean' ? (
                  <select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select value</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <Input
                    type={filterableFields.find(f => f.name === selectedField)?.type === 'number' ? 'number' : 
                          filterableFields.find(f => f.name === selectedField)?.type === 'date' ? 'date' : 'text'}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Enter value"
                    className="h-9"
                  />
                )}
              </div>
            )}

            {/* Clear Filter Button */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Global Search */}
        {showSearch && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        )}

        {/* Add Record Button - Always on the far right */}
        <div className="ml-auto">
          {showAddButton && onAddRecord && handleAddRecord && (
            <Button
              onClick={handleAddRecord}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 
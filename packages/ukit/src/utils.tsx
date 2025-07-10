import { ReactNode } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Entity, EntityField, FieldConfig } from "./types";

/**
 * Get sorted fields based on order configuration
 * @param entity - Entity schema definition
 * @param config - Field configuration mapping
 * @returns Sorted array of entity fields
 */
export const getSortedFields = (entity: Entity, config?: Record<string, FieldConfig>): EntityField[] => {
  const fields = entity.fields || [];
  
  return fields
    .filter(field => !config?.[field.name]?.hidden)
    .sort((a, b) => {
      const orderA = config?.[a.name]?.order ?? 999;
      const orderB = config?.[b.name]?.order ?? 999;
      return orderA - orderB;
    });
};

/**
 * Render field value with custom render function if provided
 * @param value - The field value to render
 * @param field - Field schema definition
 * @param record - Complete record object
 * @param index - Record index in the data array
 * @param config - Field-specific configuration
 * @returns Rendered React node
 */
export const renderFieldValue = (
  value: any, 
  field: EntityField, 
  record: any, 
  index: number, 
  config?: FieldConfig
): ReactNode => {
  // Use custom render function if provided
  if (config?.render) {
    return config.render(value, record, index);
  }

  // Handle null/undefined values
  if (value === null || value === undefined) {
    return <span className="text-gray-500 italic">null</span>;
  }

  // Type-specific rendering with syntax highlighting
  switch (field.type) {
    case 'string':
      return <span className="text-green-600 dark:text-green-400">"{String(value)}"</span>;
    
    case 'number':
      return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    
    case 'boolean':
      return (
        <span className={`${value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {value.toString()}
        </span>
      );
    
    case 'date':
      const dateValue = new Date(value);
      // Use a consistent date format to prevent hydration mismatches
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0] + ' ' + date.toISOString().split('T')[1].slice(0, 8);
      };
      return (
        <span className="text-purple-600 dark:text-purple-400" title={dateValue.toISOString()}>
          {formatDate(dateValue)}
        </span>
      );
    
    case 'object':
    case 'array':
      if (typeof value === 'object') {
        return (
          <span className="text-orange-600 dark:text-orange-400" title={JSON.stringify(value, null, 2)}>
            {JSON.stringify(value)}
          </span>
        );
      }
      break;
    
    default:
      // Default string rendering
      if (typeof value === 'object') {
        return (
          <span className="text-orange-600 dark:text-orange-400" title={JSON.stringify(value, null, 2)}>
            {JSON.stringify(value)}
          </span>
        );
      }
      return <span className="text-gray-800 dark:text-gray-200">{String(value)}</span>;
  }
  
  return <span className="text-gray-800 dark:text-gray-200">{String(value)}</span>;
};

/**
 * Utility function to combine class names with Tailwind CSS conflict resolution
 * @param inputs - Array of class names or conditional classes
 * @returns Combined class string with proper Tailwind conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique key for a record
 * @param record - Data record
 * @param index - Record index
 * @returns Unique key string
 */
export const generateRecordKey = (record: any, index: number): string => {
  // Always include index to ensure uniqueness, even if id exists
  if (record.id !== undefined && record.id !== null) {
    return `record-${record.id}-${index}`;
  }
  
  // Fallback to index only
  return `record-index-${index}`;
};

/**
 * Validate field value against field configuration
 * @param value - Field value
 * @param field - Field schema definition
 * @param config - Field configuration
 * @returns Validation result
 */
export const validateFieldValue = (
  value: any, 
  field: EntityField, 
  config?: FieldConfig
): { valid: boolean; error?: string } => {
  // Check if required field is empty
  if ((field.required || config?.required) && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${field.name} is required` };
  }
  
  // Type-specific validation
  switch (config?.type || field.type) {
    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { valid: false, error: 'Invalid email format' };
      }
      break;
    
    case 'number':
      if (value && isNaN(Number(value))) {
        return { valid: false, error: 'Must be a valid number' };
      }
      break;
  }
  
  return { valid: true };
}; 
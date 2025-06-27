import { ReactNode } from "react";
import { Entity, EntityField, FieldConfig } from "./types";

// Get sorted fields based on order configuration
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

// Render field value with custom render function if provided
export const renderFieldValue = (
  value: any, 
  field: EntityField, 
  record: any, 
  index: number, 
  config?: FieldConfig
): ReactNode => {
  if (config?.render) {
    return config.render(value, record, index);
  }

  // Default rendering based on field type
  if (value === null || value === undefined) {
    return <span className="text-gray-500">null</span>;
  }

  switch (field.type) {
    case 'string':
      return <span className="text-green-400">"{value}"</span>;
    case 'number':
      return <span className="text-blue-400">{value}</span>;
    case 'boolean':
      return <span className="text-purple-400">{value.toString()}</span>;
    case 'date':
      return <span className="text-cyan-400">{new Date(value).toLocaleString()}</span>;
    default:
      if (typeof value === 'object') {
        return <span className="text-orange-400">{JSON.stringify(value)}</span>;
      }
      return <span>{String(value)}</span>;
  }
}; 
import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue } from "../utils";

export const GridLayout: React.FC<LayoutProps> = ({ 
  entity, 
  data, 
  config,
  generalConfig,
  onEdit,
  onDelete
}) => {
  const sortedFields = getSortedFields(entity, config);
  const displayFields = sortedFields.slice(0, 3); // Show first 3 fields in grid

  const handleEdit = (record: any, index: number) => {
    if (onEdit) {
      onEdit(record, index);
    }
  };

  const handleDelete = async (record: any, index: number) => {
    if (!onDelete) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;
    
    try {
      await onDelete(record, index);
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {data.map((record, index) => (
        <div key={index} className="bg-gray-900 rounded-lg border border-gray-800 p-4 hover:border-gray-700 transition-all hover:shadow-lg group">
          {/* Grid Item Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-mono">#{index + 1}</span>
            {(generalConfig?.showActions && (onEdit || onDelete)) && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {(generalConfig?.actions?.edit !== false && onEdit) && (
                  <button
                    onClick={() => handleEdit(record, index)}
                    className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                    title="Edit"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                )}
                {(generalConfig?.actions?.delete !== false && onDelete) && (
                  <button
                    onClick={() => handleDelete(record, index)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                    title="Delete"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Grid Item Content */}
          <div className="space-y-2">
            {displayFields.map(field => (
              <div key={field.name} className="text-center">
                <div className="text-xs text-gray-500 mb-1">
                  {config?.[field.name]?.label || field.name}
                </div>
                <div className="text-sm text-gray-300 truncate" title={JSON.stringify(record[field.name])}>
                  {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}; 
import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue } from "../utils";

export const ListLayout: React.FC<LayoutProps> = ({ 
  entity, 
  data, 
  config,
  generalConfig,
  onEdit,
  onDelete
}) => {
  const sortedFields = getSortedFields(entity, config);
  const primaryField = sortedFields[0];
  const secondaryFields = sortedFields.slice(1, 3);

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
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="divide-y divide-gray-800">
        {data.map((record, index) => (
          <div key={index} className="px-6 py-4 hover:bg-gray-800/50 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {/* Primary field */}
                {primaryField && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-300">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white truncate">
                        {renderFieldValue(record[primaryField.name], primaryField, record, index, config?.[primaryField.name])}
                      </div>
                      
                      {/* Secondary fields */}
                      {secondaryFields.length > 0 && (
                        <div className="mt-1 flex items-center space-x-4">
                          {secondaryFields.map(field => (
                            <div key={field.name} className="text-xs text-gray-400">
                              <span className="font-medium">
                                {config?.[field.name]?.label || field.name}:
                              </span>
                              <span className="ml-1">
                                {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              {(generalConfig?.showActions && (onEdit || onDelete)) && (
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(generalConfig?.actions?.edit !== false && onEdit) && (
                    <button
                      onClick={() => handleEdit(record, index)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                  )}
                  {(generalConfig?.actions?.delete !== false && onDelete) && (
                    <button
                      onClick={() => handleDelete(record, index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  )}
                  
                  {generalConfig?.actions?.custom?.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={() => action.onClick(record, index)}
                      className={action.className || "p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded transition-colors"}
                      title={action.label}
                    >
                      {action.icon || (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 
import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { Button } from "./ui/button";

/**
 * List layout component for displaying data in a linear list format
 */
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

  /**
   * Handle edit action for a record
   */
  const handleEdit = (record: any, index: number) => {
    if (onEdit) {
      onEdit(record, index);
    }
  };

  /**
   * Handle delete action for a record
   */
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

  /**
   * Render action buttons for a record
   */
  const renderActionButtons = (record: any, index: number) => (
    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {(generalConfig?.actions?.edit !== false && onEdit) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(record, index)}
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          title="Edit record"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </Button>
      )}
      {(generalConfig?.actions?.delete !== false && onDelete) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(record, index)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Delete record"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </Button>
      )}
      
      {generalConfig?.actions?.custom?.map((action, actionIndex) => (
        <Button
          key={actionIndex}
          variant="ghost"
          size="sm"
          onClick={() => action.onClick(record, index)}
          className={`h-8 w-8 p-0 ${action.className || 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'}`}
          title={action.label}
        >
          {action.icon || (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          )}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {data.map((record, index) => (
          <div 
            key={generateRecordKey(record, index)} 
            className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {/* Primary field display */}
                {primaryField && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                          {config?.[primaryField.name]?.label || primaryField.name}:
                        </span>
                        {renderFieldValue(record[primaryField.name], primaryField, record, index, config?.[primaryField.name])}
                      </div>
                      
                      {/* Secondary fields display */}
                      {secondaryFields.length > 0 && (
                        <div className="mt-1 flex items-center space-x-4">
                          {secondaryFields.map(field => (
                            <div key={field.name} className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              <span className="font-medium mr-1">
                                {config?.[field.name]?.label || field.name}:
                              </span>
                              <span className="truncate max-w-24" title={JSON.stringify(record[field.name])}>
                                {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                              </span>
                            </div>
                          ))}
                          {sortedFields.length > 3 && (
                            <div className="text-xs text-gray-400">
                              +{sortedFields.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              {(generalConfig?.showActions && (onEdit || onDelete || generalConfig?.actions?.custom)) && 
                renderActionButtons(record, index)
              }
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {data.length} record{data.length !== 1 ? 's' : ''} in {entity.name}
        </div>
      </div>
    </div>
  );
}; 
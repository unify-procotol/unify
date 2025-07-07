import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

/**
 * Card layout component for displaying data in card format
 */
export const CardLayout: React.FC<LayoutProps> = ({ 
  entity, 
  data, 
  config,
  generalConfig,
  onEdit,
  onDelete
}) => {
  const sortedFields = getSortedFields(entity, config);

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
    <div className="flex items-center space-x-1">
      {(generalConfig?.actions?.edit !== false && onEdit) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(record, index)}
          className="h-6 w-6 p-0"
          title="Edit record"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </Button>
      )}
      {(generalConfig?.actions?.delete !== false && onDelete) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(record, index)}
          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Delete record"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className={`h-6 w-6 p-0 ${action.className || ''}`}
          title={action.label}
        >
          {action.icon || (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          )}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((record, index) => (
        <Card key={generateRecordKey(record, index)} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center space-x-2">
                <span>Record #{index + 1}</span>
                {entity.name && (
                  <Badge variant="outline" className="text-xs">
                    {entity.name}
                  </Badge>
                )}
              </CardTitle>
              {(generalConfig?.showActions && (onEdit || onDelete || generalConfig?.actions?.custom)) && 
                renderActionButtons(record, index)
              }
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Display first 3 fields prominently */}
              {sortedFields.slice(0, 3).map(field => (
                <div key={field.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {config?.[field.name]?.label || field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </div>
                  <div className="text-sm break-words">
                    {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                  </div>
                </div>
              ))}
              
              {/* Show remaining fields count if more than 3 */}
              {sortedFields.length > 3 && (
                <div className="pt-2 border-t border-gray-100">
                  <Badge variant="secondary" className="text-xs">
                    +{sortedFields.length - 3} more field{sortedFields.length - 3 !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 
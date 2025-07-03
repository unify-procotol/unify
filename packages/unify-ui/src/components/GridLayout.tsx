import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

/**
 * Grid layout component for displaying data in a compact grid format
 */
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
    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
      {data.map((record, index) => (
        <Card 
          key={generateRecordKey(record, index)} 
          className="p-4 hover:shadow-lg group transition-all duration-200 cursor-pointer"
        >
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs font-mono">
                #{index + 1}
              </Badge>
              {(generalConfig?.showActions && (onEdit || onDelete || generalConfig?.actions?.custom)) && 
                renderActionButtons(record, index)
              }
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="space-y-2">
              {displayFields.map(field => (
                <div key={field.name} className="text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    {config?.[field.name]?.label || field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div 
                    className="text-sm text-gray-900 truncate font-mono" 
                    title={JSON.stringify(record[field.name])}
                  >
                    {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                  </div>
                </div>
              ))}
              
              {/* Show additional fields count */}
              {sortedFields.length > 3 && (
                <div className="pt-2 text-center">
                  <Badge variant="secondary" className="text-xs">
                    +{sortedFields.length - 3}
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
import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Edit3, Trash2, MoreHorizontal, Database } from "lucide-react";

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
    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {(generalConfig?.actions?.edit !== false && onEdit) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(record, index)}
          className="h-8 w-8 p-0"
          title="Edit record"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      )}
      {(generalConfig?.actions?.delete !== false && onDelete) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(record, index)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          title="Delete record"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      {generalConfig?.actions?.custom?.map((action, actionIndex) => (
        <Button
          key={actionIndex}
          variant="ghost"
          size="sm"
          onClick={() => action.onClick(record, index)}
          className={`h-8 w-8 p-0 ${action.className || ''}`}
          title={action.label}
        >
          {action.icon || <MoreHorizontal className="h-4 w-4" />}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{entity.name}</h2>
          <p className="text-muted-foreground">
            {data.length} record{data.length !== 1 ? 's' : ''} in list view
          </p>
        </div>
      </div>

      {/* List */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y">
            {data.map((record, index) => (
              <div 
                key={generateRecordKey(record, index)} 
                className="group p-6 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Primary field display */}
                    {primaryField && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <span className="text-sm font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="text-sm font-medium truncate">
                            <span className="text-xs text-muted-foreground mr-2">
                              {config?.[primaryField.name]?.label || primaryField.name}:
                            </span>
                            <span className="text-foreground">
                              {renderFieldValue(record[primaryField.name], primaryField, record, index, config?.[primaryField.name])}
                            </span>
                          </div>
                          
                          {/* Secondary fields display */}
                          {secondaryFields.length > 0 && (
                            <div className="flex items-center space-x-4">
                              {secondaryFields.map(field => (
                                <div key={field.name} className="text-xs text-muted-foreground flex items-center">
                                  <span className="font-medium mr-1">
                                    {config?.[field.name]?.label || field.name}:
                                  </span>
                                  <span className="truncate max-w-24" title={JSON.stringify(record[field.name])}>
                                    {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                                  </span>
                                </div>
                              ))}
                              {sortedFields.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{sortedFields.length - 3} more
                                </Badge>
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
        </CardContent>
        
        {/* Footer */}
        <div className="border-t bg-muted/30 px-6 py-3">
          <div className="text-sm text-muted-foreground">
            {data.length} record{data.length !== 1 ? 's' : ''} in {entity.name}
          </div>
        </div>
      </Card>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Database className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No records found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            There are no {entity.name?.toLowerCase() || 'records'} to display in list view.
          </p>
        </div>
      )}
    </div>
  );
}; 
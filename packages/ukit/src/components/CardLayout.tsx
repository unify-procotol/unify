import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Edit3, Trash2, MoreHorizontal, Database } from "lucide-react";

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
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{entity.name}</h2>
          <p className="text-muted-foreground">
            {data.length} record{data.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((record, index) => (
          <Card 
            key={generateRecordKey(record, index)} 
            className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                      {entity.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Record #{index + 1}
                    </p>
                  </div>
                </div>
                {(generalConfig?.showActions && (onEdit || onDelete || generalConfig?.actions?.custom)) && 
                  renderActionButtons(record, index)
                }
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Primary fields */}
              {sortedFields.slice(0, 4).map((field, fieldIndex) => (
                <div key={field.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {config?.[field.name]?.label || field.name}
                    </span>
                    {field.required && (
                      <Badge variant="secondary" className="h-5 text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground break-words">
                    {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                  </div>
                  {fieldIndex < 3 && (
                    <div className="h-px bg-border" />
                  )}
                </div>
              ))}
              
              {/* Additional fields indicator */}
              {sortedFields.length > 4 && (
                <div className="pt-2 border-t">
                  <Badge variant="outline" className="text-xs">
                    +{sortedFields.length - 4} more field{sortedFields.length - 4 !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Database className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No records found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            There are no {entity.name?.toLowerCase() || 'records'} to display.
          </p>
        </div>
      )}
    </div>
  );
}; 
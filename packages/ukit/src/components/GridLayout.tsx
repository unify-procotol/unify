import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Edit3, Trash2, MoreHorizontal, Database } from "lucide-react";

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
    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {(generalConfig?.actions?.edit !== false && onEdit) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(record, index)}
          className="h-6 w-6 p-0"
          title="Edit record"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      )}
      {(generalConfig?.actions?.delete !== false && onDelete) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(record, index)}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          title="Delete record"
        >
          <Trash2 className="h-3 w-3" />
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
          {action.icon || <MoreHorizontal className="h-3 w-3" />}
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
            {data.length} record{data.length !== 1 ? 's' : ''} in compact grid view
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {data.map((record, index) => (
          <Card 
            key={generateRecordKey(record, index)} 
            className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
          >
            <CardHeader className="p-0 pb-3">
              <div className="flex items-center justify-between p-3">
                <Badge variant="outline" className="text-xs font-mono">
                  #{index + 1}
                </Badge>
                {(generalConfig?.showActions && (onEdit || onDelete || generalConfig?.actions?.custom)) && 
                  renderActionButtons(record, index)
                }
              </div>
            </CardHeader>
            
            <CardContent className="p-3 pt-0">
              <div className="space-y-3">
                {displayFields.map(field => (
                  <div key={field.name} className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {config?.[field.name]?.label || field.name}
                      </span>
                      {field.required && (
                        <Badge variant="destructive" className="h-3 text-[10px] px-1">
                          *
                        </Badge>
                      )}
                    </div>
                    <div 
                      className="text-sm font-mono truncate" 
                      title={JSON.stringify(record[field.name])}
                    >
                      {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                    </div>
                  </div>
                ))}
                
                {/* Show additional fields count */}
                {sortedFields.length > 3 && (
                  <div className="pt-2 text-center border-t">
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

      {/* Empty state */}
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Database className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No records found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            There are no {entity.name?.toLowerCase() || 'records'} to display in grid view.
          </p>
        </div>
      )}
    </div>
  );
}; 
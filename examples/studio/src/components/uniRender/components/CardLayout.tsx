import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue } from "../utils";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";

export const CardLayout: React.FC<LayoutProps> = ({ 
  entity, 
  data, 
  config,
  generalConfig,
  onEdit,
  onDelete
}) => {
  const sortedFields = getSortedFields(entity, config);

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((record, index) => (
        <Card key={index} className="max-w-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Record #{index + 1}
              </CardTitle>
              {(generalConfig?.showActions && (onEdit || onDelete)) && (
                <div className="flex items-center space-x-1">
                  {(generalConfig?.actions?.edit !== false && onEdit) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(record, index)}
                      className="h-6 w-6 p-0"
                      title="Edit"
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
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2">
              {sortedFields.slice(0, 3).map(field => (
                <div key={field.name} className="flex flex-col space-y-0.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {config?.[field.name]?.label || field.name}
                  </span>
                  <div className="text-xs text-foreground truncate">
                    {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                  </div>
                </div>
              ))}
              
              {sortedFields.length > 3 && (
                <div className="pt-1 border-t border-border">
                  <Badge variant="outline" className="text-xs">
                    +{sortedFields.length - 3} more fields
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
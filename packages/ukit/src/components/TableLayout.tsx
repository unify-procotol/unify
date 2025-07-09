import React, { useState } from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { EditModal } from "./EditModal";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Edit3, Trash2, MoreHorizontal, Loader2, Database } from "lucide-react";

/**
 * Table layout component for displaying data in a tabular format
 */
export const TableLayout: React.FC<LayoutProps> = ({ 
  entity, 
  data, 
  config, 
  generalConfig,
  onEdit,
  onDelete
}) => {
  const sortedFields = getSortedFields(entity, config);
  const [editingRecord, setEditingRecord] = useState<{ record: any; index: number } | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  
  const showActions = generalConfig?.showActions && (onEdit || onDelete || generalConfig?.actions?.custom);

  /**
   * Handle edit action for a record
   */
  const handleEdit = (record: any, index: number) => {
    setEditingRecord({ record, index });
  };

  /**
   * Handle delete action for a record
   */
  const handleDelete = async (record: any, index: number) => {
    if (!onDelete) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;
    
    setDeletingIndex(index);
    try {
      await onDelete(record, index);
    } catch (error) {
      console.error('Error deleting record:', error);
      // TODO: Show error message to user
    } finally {
      setDeletingIndex(null);
    }
  };

  /**
   * Handle save edit action
   */
  const handleSaveEdit = async (updatedRecord: any, index: number) => {
    if (!onEdit) return;
    await onEdit(updatedRecord, index);
    setEditingRecord(null);
  };

  /**
   * Render action buttons for a record
   */
  const renderActionButtons = (record: any, index: number) => (
    <div className="flex items-center space-x-1">
      {/* Edit button */}
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
      
      {/* Delete button */}
      {(generalConfig?.actions?.delete !== false && onDelete) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(record, index)}
          disabled={deletingIndex === index}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          title="Delete record"
        >
          {deletingIndex === index ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}
      
      {/* Custom actions */}
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

  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{entity.name || 'Records'}</h2>
            <p className="text-muted-foreground">
              Table view for {entity.name?.toLowerCase() || 'records'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Database className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No records found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            There are no {entity.name?.toLowerCase() || 'records'} to display in table view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">#</TableHead>
                  {sortedFields.map(field => (
                    <TableHead 
                      key={field.name}
                      style={{ width: config?.[field.name]?.width }}
                      className={
                        config?.[field.name]?.align === 'center' 
                          ? 'text-center' 
                          : config?.[field.name]?.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{config?.[field.name]?.label || field.name}</span>
                        {field.required && (
                          <Badge variant="destructive" className="h-4 text-[10px] px-1">
                            *
                          </Badge>
                        )}
                        <Badge variant="outline" className="h-4 text-[10px] px-1">
                          {config?.[field.name]?.type || field.type}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                  {showActions && (
                    <TableHead className="w-24 text-center">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record, index) => (
                  <TableRow key={generateRecordKey(record, index)} className="group">
                    <TableCell className="font-mono text-sm text-muted-foreground text-center">
                      {index + 1}
                    </TableCell>
                    {sortedFields.map(field => (
                      <TableCell 
                        key={field.name}
                        className={`${
                          config?.[field.name]?.align === 'center' ? 'text-center' :
                          config?.[field.name]?.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div 
                          className="max-w-xs truncate font-mono text-sm" 
                          title={JSON.stringify(record[field.name])}
                        >
                          {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                        </div>
                      </TableCell>
                    ))}
                    {showActions && (
                      <TableCell className="text-center">
                        {renderActionButtons(record, index)}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Footer with record count */}
          <div className="border-t bg-muted/30 px-6 py-3">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{data.length}</span> record{data.length !== 1 ? 's' : ''}
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <EditModal
          isOpen={true}
          onClose={() => setEditingRecord(null)}
          record={editingRecord.record}
          entity={entity}
          config={config}
          onSave={handleSaveEdit}
          index={editingRecord.index}
        />
      )}
    </>
  );
}; 
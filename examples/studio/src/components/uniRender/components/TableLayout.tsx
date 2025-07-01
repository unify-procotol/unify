import React, { useState } from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue } from "../utils";
import { EditModal } from "./EditModal";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";

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

  const handleEdit = (record: any, index: number) => {
    setEditingRecord({ record, index });
  };

  const handleDelete = async (record: any, index: number) => {
    if (!onDelete) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;
    
    setDeletingIndex(index);
    try {
      await onDelete(record, index);
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleSaveEdit = async (updatedRecord: any, index: number) => {
    if (!onEdit) return;
    await onEdit(updatedRecord, index);
    setEditingRecord(null);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {sortedFields.map(field => (
                  <TableHead 
                    key={field.name}
                    style={{ width: config?.[field.name]?.width }}
                  >
                    {config?.[field.name]?.label || field.name}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </TableHead>
                ))}
                {showActions && (
                  <TableHead>Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-muted-foreground">
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
                      <div className="font-mono text-xs max-w-xs truncate" title={JSON.stringify(record[field.name])}>
                        {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                      </div>
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {(generalConfig?.actions?.edit !== false && onEdit) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record, index)}
                            className="h-8 w-8 p-0"
                            title="Edit"
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
                            disabled={deletingIndex === index}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            {deletingIndex === index ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            )}
                          </Button>
                        )}
                        {generalConfig?.actions?.custom?.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant="ghost"
                            size="sm"
                            onClick={() => action.onClick(record, index)}
                            className="h-8 w-8 p-0"
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
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Card className="rounded-none border-x-0 border-b-0 px-4 py-3">
          <div className="text-sm text-muted-foreground">
            Showing {data.length} records
          </div>
        </Card>
      </Card>

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
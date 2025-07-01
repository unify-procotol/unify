import React, { useState } from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue } from "../utils";
import { EditModal } from "./EditModal";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";

export const FormLayout: React.FC<LayoutProps> = ({ 
  entity, 
  data, 
  config, 
  generalConfig,
  onEdit,
  onDelete,
  onSave
}) => {
  const sortedFields = getSortedFields(entity, config);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const currentRecord = data[currentIndex];
  const canEdit = generalConfig?.editable && onEdit;

  const handleEdit = () => {
    setEditingRecord(currentRecord);
    setIsEditing(true);
  };

  const handleSaveEdit = async (updatedRecord: any, index: number) => {
    if (!onEdit) return;
    setLoading(true);
    try {
      await onEdit(updatedRecord, index);
      setIsEditing(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;
    
    setLoading(true);
    try {
      await onDelete(currentRecord, currentIndex);
      // Navigate to previous record if current is deleted
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToNext = () => {
    setCurrentIndex(Math.min(currentIndex + 1, data.length - 1));
  };

  const goToPrevious = () => {
    setCurrentIndex(Math.max(currentIndex - 1, 0));
  };

  if (!currentRecord) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">No records to display</div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle>
                {entity.name} Details
              </CardTitle>
              <Badge variant="outline" className="text-sm">
                Record {currentIndex + 1} of {data.length}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                title="Previous"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                disabled={currentIndex === data.length - 1}
                title="Next"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </Button>

              {/* Action buttons */}
              {canEdit && (
                <Button
                  onClick={handleEdit}
                  disabled={loading}
                  size="sm"
                >
                  Edit
                </Button>
              )}
              
              {(generalConfig?.actions?.delete !== false && onDelete) && (
                <Button
                  onClick={handleDelete}
                  disabled={loading}
                  size="sm"
                  variant="destructive"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedFields.map(field => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  {config?.[field.name]?.label || field.name}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                <Card className="p-3">
                  <div className="text-sm text-foreground">
                    {renderFieldValue(currentRecord[field.name], field, currentRecord, currentIndex, config?.[field.name])}
                  </div>
                </Card>
                {field.description && (
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {isEditing && editingRecord && (
        <EditModal
          isOpen={true}
          onClose={() => {
            setIsEditing(false);
            setEditingRecord(null);
          }}
          record={editingRecord}
          entity={entity}
          config={config}
          onSave={handleSaveEdit}
          index={currentIndex}
        />
      )}
    </>
  );
}; 
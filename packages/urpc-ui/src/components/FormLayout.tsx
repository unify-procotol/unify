import React, { useState } from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue } from "../utils";
import { EditModal } from "./EditModal";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

/**
 * Form layout component for displaying data in form format with navigation
 */
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

  /**
   * Handle edit action
   */
  const handleEdit = () => {
    setEditingRecord(currentRecord);
    setIsEditing(true);
  };

  /**
   * Handle save edit action
   */
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

  /**
   * Handle delete action
   */
  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;
    
    setLoading(true);
    try {
      await onDelete(currentRecord, currentIndex);
      // Navigate to previous record if current is deleted and it exists
      if (currentIndex > 0 && data.length > 1) {
        setCurrentIndex(currentIndex - 1);
      } else if (data.length > 1) {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to next record
   */
  const goToNext = () => {
    setCurrentIndex(Math.min(currentIndex + 1, data.length - 1));
  };

  /**
   * Navigate to previous record
   */
  const goToPrevious = () => {
    setCurrentIndex(Math.max(currentIndex - 1, 0));
  };

  /**
   * Navigate to specific record by index
   */
  const goToRecord = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, data.length - 1)));
  };

  if (!currentRecord) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p>No records to display</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-lg">
                {entity.name} Details
              </CardTitle>
              <Badge variant="outline" className="text-sm">
                Record {currentIndex + 1} of {data.length}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Navigation controls */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  title="Previous record"
                  className="h-8 w-8 p-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </Button>
                
                <div className="flex items-center space-x-1 px-2">
                  <input
                    type="number"
                    min="1"
                    max={data.length}
                    value={currentIndex + 1}
                    onChange={(e) => goToRecord(Number(e.target.value) - 1)}
                    className="w-16 px-2 py-1 text-xs border rounded text-center"
                  />
                  <span className="text-xs text-gray-500">/ {data.length}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  disabled={currentIndex === data.length - 1}
                  title="Next record"
                  className="h-8 w-8 p-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </Button>
              </div>

              {/* Action buttons */}
              {canEdit && (
                <Button
                  onClick={handleEdit}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
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
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  )}
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
                <div className="flex items-center space-x-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {config?.[field.name]?.label || field.name}
                  </label>
                  {field.required && <span className="text-red-500 text-xs">*</span>}
                </div>
                
                <Card className="p-3 bg-gray-50/50">
                  <div className="text-sm text-gray-900 break-words">
                    {renderFieldValue(currentRecord[field.name], field, currentRecord, currentIndex, config?.[field.name])}
                  </div>
                </Card>
                
                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
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
import React, { useState } from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue } from "../utils";
import { EditModal } from "./EditModal";

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
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
        <div className="text-gray-400">No records to display</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        {/* Header with navigation */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-white">
                {entity.name} Details
              </h2>
              <span className="text-sm text-gray-400">
                Record {currentIndex + 1} of {data.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Navigation buttons */}
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              
              <button
                onClick={goToNext}
                disabled={currentIndex === data.length - 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              {/* Action buttons */}
              {canEdit && (
                <button
                  onClick={handleEdit}
                  disabled={loading}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </button>
              )}
              
              {(generalConfig?.actions?.delete !== false && onDelete) && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedFields.map(field => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {config?.[field.name]?.label || field.name}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="text-sm text-gray-300">
                    {renderFieldValue(currentRecord[field.name], field, currentRecord, currentIndex, config?.[field.name])}
                  </div>
                </div>
                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

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
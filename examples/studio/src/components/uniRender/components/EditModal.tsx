import React, { useState } from "react";
import { Entity, FieldConfig, EntityField } from "../types";
import { getSortedFields } from "../utils";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  entity: Entity;
  config?: Record<string, FieldConfig>;
  onSave?: (record: any, index: number) => Promise<void> | void;
  index: number;
}

export const EditModal: React.FC<EditModalProps> = ({ 
  isOpen, 
  onClose, 
  record, 
  entity, 
  config, 
  onSave,
  index
}) => {
  const [formData, setFormData] = useState(record);
  const [loading, setLoading] = useState(false);
  const sortedFields = getSortedFields(entity, config);
  const editableFields = sortedFields.filter(field => 
    config?.[field.name]?.editable !== false
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    
    setLoading(true);
    try {
      await onSave(formData, index);
      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const renderEditField = (field: EntityField) => {
    const fieldConfig = config?.[field.name];
    const fieldType = fieldConfig?.type || field.type;
    const value = formData[field.name];

    switch (fieldType) {
      case 'checkbox':
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => handleInputChange(field.name, e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring"
          />
        );
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select {field.name}</option>
            {fieldConfig?.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
            placeholder={`Enter ${field.name}...`}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value ? Number(e.target.value) : '')}
            placeholder={`Enter ${field.name}...`}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
          />
        );
      
      case 'email':
        return (
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={`Enter ${field.name}...`}
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={typeof value === 'object' ? JSON.stringify(value) : value || ''}
            onChange={(e) => {
              let newValue = e.target.value;
              // Try to parse JSON for object fields
              if (typeof record[field.name] === 'object' && newValue) {
                try {
                  newValue = JSON.parse(newValue);
                } catch (error) {
                  // Keep as string if parsing fails
                }
              }
              handleInputChange(field.name, newValue);
            }}
            placeholder={`Enter ${field.name}...`}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Record</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editableFields.map(field => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  {config?.[field.name]?.label || field.name}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                {renderEditField(field)}
              </div>
            ))}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 
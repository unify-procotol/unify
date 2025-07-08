import React, { useState } from "react";
import { EditModalProps } from "../types";
import { getSortedFields } from "../utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "./ui/dialog";
import { Save, Loader2, AlertCircle, Edit } from "lucide-react";

/**
 * Modal component for editing records
 */
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const sortedFields = getSortedFields(entity, config);
  const editableFields = sortedFields.filter(field => 
    config?.[field.name]?.editable !== false
  );

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    
    // Clear previous errors
    setErrors({});
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    editableFields.forEach(field => {
      const fieldConfig = config?.[field.name];
      const isRequired = field.required || fieldConfig?.required;
      const value = formData[field.name];
      
      if (isRequired && (value === null || value === undefined || value === '')) {
        newErrors[field.name] = `${fieldConfig?.label || field.name} is required`;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData, index);
      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
      setErrors({ _general: 'Failed to save changes. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input value changes
   */
  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  /**
   * Render input field based on field type
   */
  const renderEditField = (field: any) => {
    const fieldConfig = config?.[field.name];
    const fieldType = fieldConfig?.type || field.type;
    const value = formData[field.name];
    const hasError = !!errors[field.name];

    const commonProps = {
      id: field.name,
      name: field.name,
    };

    switch (fieldType) {
      case 'checkbox':
      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className={`h-4 w-4 rounded border-2 text-primary focus:ring-2 focus:ring-ring ${
                hasError ? 'border-destructive' : 'border-input'
              }`}
              {...commonProps}
            />
            <Label htmlFor={field.name} className="text-sm font-medium cursor-pointer">
              {fieldConfig?.label || field.name}
            </Label>
          </div>
        );
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              hasError ? 'border-destructive focus:border-destructive' : ''
            }`}
            {...commonProps}
          >
            <option value="">Select {fieldConfig?.label || field.name}</option>
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
            className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical ${
              hasError ? 'border-destructive focus:border-destructive' : ''
            }`}
            placeholder={`Enter ${fieldConfig?.label || field.name}...`}
            {...commonProps}
          />
        );
     
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value ? Number(e.target.value) : '')}
            placeholder={`Enter ${fieldConfig?.label || field.name}...`}
            className={hasError ? 'border-destructive focus:border-destructive' : ''}
            {...commonProps}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={hasError ? 'border-destructive focus:border-destructive' : ''}
            {...commonProps}
          />
        );
      
      case 'email':
        return (
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={`Enter ${fieldConfig?.label || field.name}...`}
            className={hasError ? 'border-destructive focus:border-destructive' : ''}
            {...commonProps}
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
            placeholder={`Enter ${fieldConfig?.label || field.name}...`}
            className={hasError ? 'border-destructive focus:border-destructive' : ''}
            {...commonProps}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Edit className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold">
                Edit {entity.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Record #{index + 1}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-1">
          {/* Display general error */}
          {errors._general && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/10 bg-destructive/5 p-4 mb-6">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive">{errors._general}</p>
              </div>
            </div>
          )}

          {/* Render form fields */}
          <div className="space-y-6">
            {editableFields.map(field => (
              <div key={field.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {config?.[field.name]?.label || field.name}
                  </Label>
                  <div className="flex items-center gap-2">
                    {(field.required || config?.[field.name]?.required) && (
                      <Badge variant="destructive" className="h-6 text-xs">
                        Required
                      </Badge>
                    )}
                    <Badge variant="outline" className="h-6 text-xs">
                      {config?.[field.name]?.type || field.type}
                    </Badge>
                  </div>
                </div>
                {renderEditField(field)}
                {errors[field.name] && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors[field.name]}
                  </div>
                )}
                {field.description && (
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
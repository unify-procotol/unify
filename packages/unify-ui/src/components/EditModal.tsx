import React, { useState } from "react";
import { EditModalProps } from "../types";
import { getSortedFields } from "../utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
           <div className="flex items-center space-x-2">
             <input
               type="checkbox"
               checked={value || false}
               onChange={(e) => handleInputChange(field.name, e.target.checked)}
               className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                 hasError ? 'border-red-500 focus:ring-red-500' : ''
               }`}
               {...commonProps}
             />
             <Label htmlFor={field.name} className="text-sm">
               {fieldConfig?.label || field.name}
             </Label>
           </div>
         );
       
       case 'select':
         return (
           <select
             value={value || ''}
             onChange={(e) => handleInputChange(field.name, e.target.value)}
             className={`w-full px-3 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 ${
               hasError ? 'border-red-500' : 'border-gray-300'
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
             className={`w-full px-3 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-vertical ${
               hasError ? 'border-red-500' : 'border-gray-300'
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
             className={hasError ? 'border-red-500 focus:ring-red-500' : undefined}
             {...commonProps}
           />
         );
       
       case 'date':
         return (
           <Input
             type="date"
             value={value ? new Date(value).toISOString().split('T')[0] : ''}
             onChange={(e) => handleInputChange(field.name, e.target.value)}
             className={hasError ? 'border-red-500 focus:ring-red-500' : undefined}
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
             className={hasError ? 'border-red-500 focus:ring-red-500' : undefined}
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
             className={hasError ? 'border-red-500 focus:ring-red-500' : undefined}
             {...commonProps}
           />
         );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Edit {entity.name} Record</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display general error */}
            {errors._general && (
              <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
                {errors._general}
              </div>
            )}

            {/* Render form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editableFields.map(field => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {config?.[field.name]?.label || field.name}
                    {(field.required || config?.[field.name]?.required) && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {renderEditField(field)}
                  {errors[field.name] && (
                    <p className="text-sm text-red-600">{errors[field.name]}</p>
                  )}
                  {field.description && (
                    <p className="text-xs text-gray-500">{field.description}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
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
import React, { useState } from "react";
import { LayoutProps } from "../types";
import { getSortedFields } from "../utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Save,
  FileText,
  Loader2
} from "lucide-react";

/**
 * Form layout component for creating/editing records
 */
export const FormLayout: React.FC<LayoutProps> = ({ 
  entity, 
  config, 
  generalConfig,
  onSave
}) => {
  const sortedFields = getSortedFields(entity, config);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter out relation fields
  const inputFields = sortedFields.filter(field => {
    const isRelationField = 
      (field.type === 'array') ||
      (typeof field.type === 'string' && field.type.endsWith('Entity'));
    return !isRelationField;
  });

  /**
   * Handle input change
   */
  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    inputFields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name] === '')) {
        newErrors[field.name] = `${field.name} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !onSave) return;
    
    setLoading(true);
    try {
      await onSave(formData, -1); // -1 indicates new record
      // Reset form after successful save
      setFormData({});
      setErrors({});
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render input field based on type
   */
  const renderInputField = (field: any) => {
    const fieldValue = formData[field.name] || '';
    const fieldError = errors[field.name];
    
    const baseProps = {
      id: field.name,
      value: fieldValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
        handleInputChange(field.name, e.target.value),
      className: `${fieldError ? 'border-red-500' : ''}`
    };

    switch (field.type) {
      case 'number':
      case 'integer':
        return (
          <Input
            {...baseProps}
            type="number"
            placeholder={`Enter ${field.name}...`}
            onChange={(e) => 
              handleInputChange(field.name, e.target.value ? Number(e.target.value) : '')
            }
          />
        );
      
      case 'boolean':
    return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              checked={!!fieldValue}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor={field.name} className="text-sm">
              {config?.[field.name]?.label || field.name}
            </Label>
        </div>
        );
      
      case 'email':
        return (
          <Input
            {...baseProps}
            type="email"
            placeholder={`Enter ${field.name}...`}
          />
        );
      
      case 'url':
        return (
          <Input
            {...baseProps}
            type="url"
            placeholder={`Enter ${field.name}...`}
          />
        );
      
      default:
        return (
          <Input
            {...baseProps}
            type="text"
            placeholder={`Enter ${field.name}...`}
          />
    );
  }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
            {inputFields.map(field => (
                <div key={field.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                      {config?.[field.name]?.label || field.name}
                    </Label>
                    <div className="flex items-center gap-2">
                      {field.required && (
                        <Badge variant="destructive" className="h-5 text-xs">
                          Required
                        </Badge>
                      )}
                      <Badge variant="outline" className="h-5 text-xs">
                        {config?.[field.name]?.type || field.type}
                      </Badge>
                    </div>
                  </div>
                  
                <div className="space-y-2">
                  {field.type === 'boolean' ? (
                    renderInputField(field)
                  ) : (
                    <>
                      <Label htmlFor={field.name} className="sr-only">
                        {config?.[field.name]?.label || field.name}
                      </Label>
                      {renderInputField(field)}
                    </>
                  )}
                  
                  {errors[field.name] && (
                    <p className="text-xs text-red-500">{errors[field.name]}</p>
                  )}
                  </div>
                  
                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Creating...' : 'Create Record'}
        </Button>
      </div>
    </form>
  );
}; 
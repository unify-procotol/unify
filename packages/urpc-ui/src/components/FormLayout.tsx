import React, { useState } from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue } from "../utils";
import { EditModal } from "./EditModal";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  FileText,
  Loader2
} from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No records to display</h3>
        <p className="text-sm text-muted-foreground">
          There are no records available to show.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {entity.name} Details
                  </CardTitle>
                  <Badge variant="outline" className="text-sm">
                    Record {currentIndex + 1} of {data.length}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Navigation controls */}
                <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    title="Previous record"
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-2 px-2">
                    <Input
                      type="number"
                      min="1"
                      max={data.length}
                      value={currentIndex + 1}
                      onChange={(e) => goToRecord(Number(e.target.value) - 1)}
                      className="w-16 h-8 text-xs text-center"
                    />
                    <span className="text-xs text-muted-foreground">/ {data.length}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNext}
                    disabled={currentIndex === data.length - 1}
                    title="Next record"
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  {canEdit && (
                    <Button
                      onClick={handleEdit}
                      disabled={loading}
                      size="sm"
                      variant="outline"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {sortedFields.map(field => (
                <div key={field.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
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
                  
                  <div className="min-h-[2.5rem] rounded-md border bg-muted/30 p-3">
                    <div className="text-sm break-words">
                      {renderFieldValue(currentRecord[field.name], field, currentRecord, currentIndex, config?.[field.name])}
                    </div>
                  </div>
                  
                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
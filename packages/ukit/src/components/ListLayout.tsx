import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { useLayoutActions } from "../hooks/useLayoutActions";
import { ActionButtons } from "./common/ActionButtons";
import { CommonModals } from "./common/CommonModals";
import { EmptyState } from "./common/EmptyState";
import { LayoutHeader } from "./common/LayoutHeader";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

// Extended LayoutProps to include add record functionality
interface ExtendedLayoutProps extends LayoutProps {
  // Add Record props
  showAddButton?: boolean;
  onAddRecord?: (record: any) => Promise<void>;
  
  // General list controls
  showTopControls?: boolean;
  
  // Entity instance for custom actions
  entityInstance?: any;
  
  // Refresh callback for custom actions
  onRefresh?: () => Promise<void>;
}

/**
 * List layout component for displaying data in a linear list format
 */
export const ListLayout: React.FC<ExtendedLayoutProps> = ({ 
  entity, 
  data, 
  config,
  generalConfig,
  onEdit,
  onDelete,
  // Add Record props
  showAddButton = true,
  onAddRecord,
  // General controls
  showTopControls = true,
  // Entity instance
  entityInstance,
  // Refresh callback
  onRefresh
}) => {
  const sortedFields = getSortedFields(entity, config);
  const primaryField = sortedFields[0];
  const secondaryFields = sortedFields.slice(1, 3);

  // Use the common layout actions hook
  const {
    editingRecord,
    deletingIndex,
    showAddModal,
    deleteConfirmation,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleSaveEdit,
    handleAddRecord,
    handleSaveRecord,
    createActionHandler,
    setEditingRecord,
    setShowAddModal,
    setDeleteConfirmation
  } = useLayoutActions({
    onEdit,
    onDelete,
    onAddRecord,
    entityInstance,
    generalConfig,
    onRefresh
  });

  if (data.length === 0) {
    return (
      <>
        <EmptyState
          entity={entity}
          showTopControls={showTopControls}
          showAddButton={showAddButton}
          onAddRecord={onAddRecord}
          handleAddRecord={handleAddRecord}
          viewName="List"
        />
        
        {/* Common Modals - needed even when data is empty */}
        <CommonModals
          editingRecord={editingRecord}
          setEditingRecord={setEditingRecord}
          entity={entity}
          config={config}
          handleSaveEdit={handleSaveEdit}
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          handleSaveRecord={handleSaveRecord}
          deleteConfirmation={deleteConfirmation}
          setDeleteConfirmation={setDeleteConfirmation}
          confirmDelete={confirmDelete}
          deletingIndex={deletingIndex}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Top Controls */}
        <LayoutHeader
          entity={entity}
          data={data}
          showTopControls={showTopControls}
          showAddButton={showAddButton}
          onAddRecord={onAddRecord}
          handleAddRecord={handleAddRecord}
          viewName="list"
        />

        {/* List */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y">
              {data.map((record, index) => (
                <div 
                  key={generateRecordKey(record, index)} 
                  className="group p-6 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Primary field display */}
                      {primaryField && (
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              <span className="text-sm font-bold text-muted-foreground">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="text-sm font-medium truncate">
                              <span className="text-xs text-muted-foreground mr-2">
                                {config?.[primaryField.name]?.label || primaryField.name}:
                              </span>
                              <span className="text-foreground">
                                {renderFieldValue(record[primaryField.name], primaryField, record, index, config?.[primaryField.name])}
                              </span>
                            </div>
                            
                            {/* Secondary fields display */}
                            {secondaryFields.length > 0 && (
                              <div className="flex items-center space-x-4">
                                {secondaryFields.map(field => (
                                  <div key={field.name} className="text-xs text-muted-foreground flex items-center">
                                    <span className="font-medium mr-1">
                                      {config?.[field.name]?.label || field.name}:
                                    </span>
                                    <span className="truncate max-w-24" title={JSON.stringify(record[field.name])}>
                                      {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                                    </span>
                                  </div>
                                ))}
                                {sortedFields.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{sortedFields.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    {(generalConfig?.showActions && (onEdit || onDelete || generalConfig?.actions?.custom)) && (
                      <ActionButtons
                        record={record}
                        index={index}
                        generalConfig={generalConfig}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        deletingIndex={deletingIndex}
                        createActionHandler={createActionHandler}
                        size="sm"
                        className="space-x-2"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          {/* Footer */}
          <div className="border-t bg-muted/30 px-6 py-3">
            <div className="text-sm text-muted-foreground">
              {data.length} record{data.length !== 1 ? 's' : ''} in {entity.name}
            </div>
          </div>
        </Card>
      </div>

      {/* Common Modals */}
      <CommonModals
        editingRecord={editingRecord}
        setEditingRecord={setEditingRecord}
        entity={entity}
        config={config}
        handleSaveEdit={handleSaveEdit}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        handleSaveRecord={handleSaveRecord}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
        confirmDelete={confirmDelete}
        deletingIndex={deletingIndex}
      />
    </>
  );
}; 
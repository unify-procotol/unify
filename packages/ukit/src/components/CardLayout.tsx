import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { useLayoutActions } from "../hooks/useLayoutActions";
import { ActionButtons } from "./common/ActionButtons";
import { CommonModals } from "./common/CommonModals";
import { EmptyState } from "./common/EmptyState";
import { LayoutHeader } from "./common/LayoutHeader";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

// Extended LayoutProps to include add record functionality
interface ExtendedLayoutProps extends LayoutProps {
  // Add Record props
  showAddButton?: boolean;
  onAddRecord?: (record: any) => Promise<void>;
  
  // General card controls
  showTopControls?: boolean;
  
  // Entity instance for custom actions
  entityInstance?: any;
  
  // Refresh callback for custom actions
  onRefresh?: () => Promise<void>;
}

/**
 * Card layout component for displaying data in card format
 */
export const CardLayout: React.FC<ExtendedLayoutProps> = ({ 
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
          viewName="Card"
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
      <div className="space-y-8">
        {/* Top Controls */}
        <LayoutHeader
          entity={entity}
          data={data}
          showTopControls={showTopControls}
          showAddButton={showAddButton}
          onAddRecord={onAddRecord}
          handleAddRecord={handleAddRecord}
          viewName="card"
          title={entity.name}
          description={`${data.length} record${data.length !== 1 ? 's' : ''} found`}
        />

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((record, index) => (
            <Card 
              key={generateRecordKey(record, index)} 
              className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">
                        {entity.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Record #{index + 1}
                      </p>
                    </div>
                  </div>
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
                      className="gap-1"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Primary fields */}
                {sortedFields.slice(0, 4).map((field, fieldIndex) => (
                  <div key={field.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {config?.[field.name]?.label || field.name}
                      </span>
                      {field.required && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground break-words">
                      {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                    </div>
                    {fieldIndex < 3 && (
                      <div className="h-px bg-border" />
                    )}
                  </div>
                ))}
                
                {/* Additional fields indicator */}
                {sortedFields.length > 4 && (
                  <div className="pt-2 border-t">
                    <Badge variant="outline" className="text-xs">
                      +{sortedFields.length - 4} more field{sortedFields.length - 4 !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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
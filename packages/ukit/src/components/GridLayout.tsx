import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { useLayoutActions } from "../hooks/useLayoutActions";
import { ActionButtons } from "./common/ActionButtons";
import { CommonModals } from "./common/CommonModals";
import { EmptyState } from "./common/EmptyState";
import { LayoutHeader } from "./common/LayoutHeader";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

// Extended LayoutProps to include add record functionality
interface ExtendedLayoutProps extends LayoutProps {
  // Add Record props
  showAddButton?: boolean;
  onAddRecord?: (record: any) => Promise<void>;
  
  // General grid controls
  showTopControls?: boolean;
  
  // Entity instance for custom actions
  entityInstance?: any;
  
  // Refresh callback for custom actions
  onRefresh?: () => Promise<void>;
}

/**
 * Grid layout component for displaying data in a compact grid format
 */
export const GridLayout: React.FC<ExtendedLayoutProps> = ({ 
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
  const displayFields = sortedFields.slice(0, 3); // Show first 3 fields in grid

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
          viewName="Grid"
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
          viewName="compact grid"
        />

        {/* Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
          {data.map((record, index) => (
            <Card 
              key={generateRecordKey(record, index)} 
              className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
            >
              <CardHeader className="p-0 pb-3">
                <div className="flex items-center justify-between p-3">
                  <Badge variant="outline" className="text-xs font-mono">
                    #{index + 1}
                  </Badge>
                  {(generalConfig?.showActions && (onEdit || onDelete || generalConfig?.actions?.custom)) && (
                    <ActionButtons
                      record={record}
                      index={index}
                      generalConfig={generalConfig}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deletingIndex={deletingIndex}
                      createActionHandler={createActionHandler}
                      size="default"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-3 pt-0">
                <div className="space-y-3">
                  {displayFields.map(field => (
                    <div key={field.name} className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {config?.[field.name]?.label || field.name}
                        </span>
                        {field.required && (
                          <Badge variant="destructive" className="h-3 text-[10px] px-1">
                            *
                          </Badge>
                        )}
                      </div>
                      <div 
                        className="text-sm font-mono truncate" 
                        title={JSON.stringify(record[field.name])}
                      >
                        {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                      </div>
                    </div>
                  ))}
                  
                  {/* Show additional fields count */}
                  {sortedFields.length > 3 && (
                    <div className="pt-2 text-center border-t">
                      <Badge variant="secondary" className="text-xs">
                        +{sortedFields.length - 3}
                      </Badge>
                    </div>
                  )}
                </div>
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
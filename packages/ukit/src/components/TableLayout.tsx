import React, { useState, useMemo } from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue, generateRecordKey } from "../utils";
import { useLayoutActions } from "../hooks/useLayoutActions";
import { ActionButtons } from "./common/ActionButtons";
import { CommonModals } from "./common/CommonModals";
import { EmptyState } from "./common/EmptyState";
import { LayoutHeader } from "./common/LayoutHeader";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Extended LayoutProps to include pagination and add record functionality
interface ExtendedLayoutProps extends LayoutProps {
  // Pagination props
  enablePagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  
  // Add Record props
  showAddButton?: boolean;
  onAddRecord?: (record: any) => Promise<void>;
  
  // General table controls
  showTopControls?: boolean;
  
  // Filter props
  showFilter?: boolean;
  filterConfig?: {
    showFieldFilter?: boolean;
    showSearch?: boolean;
    showToggle?: boolean;
    placeholder?: string;
    defaultExpanded?: boolean;
  };
  
  // Entity instance for custom actions
  entityInstance?: any;
  
  // Refresh callback for custom actions
  onRefresh?: () => Promise<void>;
}

/**
 * Table layout component for displaying data in a tabular format with pagination and add record functionality
 */
export const TableLayout: React.FC<ExtendedLayoutProps> = ({ 
  entity, 
  data, 
  config, 
  generalConfig,
  onEdit,
  onDelete,
  // Pagination props
  enablePagination = true,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  // Add Record props
  showAddButton = true,
  onAddRecord,
  // General controls
  showTopControls = true,
  // Filter props
  showFilter = generalConfig?.table?.showFilter ?? true,
  filterConfig = generalConfig?.table?.filterConfig,
  // Entity instance
  entityInstance,
  // Refresh callback
  onRefresh
}) => {
  const sortedFields = getSortedFields(entity, config);
  
  // Filter state
  const [filteredData, setFilteredData] = useState(data);
  
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
  
  const [internalCurrentPage, setInternalCurrentPage] = useState(currentPage);
  
  const showActions = generalConfig?.showActions && (onEdit || onDelete || generalConfig?.actions?.custom);

  // Use controlled or uncontrolled pagination
  const activePage = onPageChange ? currentPage : internalCurrentPage;
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  // Update filtered data when original data changes
  React.useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Calculate pagination data
  const paginationData = useMemo(() => {
    if (!enablePagination) {
      return {
        paginatedData: filteredData,
        totalPages: 1,
        startIndex: 0,
        endIndex: filteredData.length,
        totalRecords: filteredData.length,
        adjustedPage: activePage
      };
    }

    const totalPages = Math.ceil(filteredData.length / pageSize);
    
    // Ensure current page doesn't exceed total pages after data refresh
    let adjustedPage = activePage;
    if (totalPages > 0 && activePage > totalPages) {
      adjustedPage = totalPages;
      // Auto-adjust page if current page exceeds total pages
      setTimeout(() => {
        handlePageChange(totalPages);
      }, 0);
    }

    const startIndex = (adjustedPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredData.length);
    console.log("filteredData=====>", filteredData);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      paginatedData,
      totalPages,
      startIndex,
      endIndex,
      totalRecords: filteredData.length,
      adjustedPage
    };
  }, [filteredData, enablePagination, activePage, pageSize]);

  /**
   * Render pagination controls
   */
  const renderPagination = () => {
    if (!enablePagination || paginationData.totalPages <= 1) return null;

    const { totalPages, adjustedPage } = paginationData;
    const currentPage = adjustedPage || activePage;
    const maxVisible = 5;
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {paginationData.startIndex + 1} to {paginationData.endIndex} of {paginationData.totalRecords} records
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(page => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <>
        <EmptyState
          entity={entity}
          showTopControls={showTopControls}
          showAddButton={showAddButton}
          onAddRecord={onAddRecord}
          handleAddRecord={handleAddRecord}
          viewName="Table"
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
          config={config}
          showTopControls={showTopControls}
          showAddButton={showAddButton}
          onAddRecord={onAddRecord}
          handleAddRecord={handleAddRecord}
          viewName="table"
          showFilter={showFilter}
          filterConfig={filterConfig}
          onFilteredDataChange={setFilteredData}
        />

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {sortedFields.map(field => (
                    <TableHead 
                      key={field.name}
                      style={{ width: config?.[field.name]?.width }}
                      className={
                        config?.[field.name]?.align === 'center' 
                          ? 'text-center' 
                          : config?.[field.name]?.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{config?.[field.name]?.label || field.name}</span>
                        {field.required && (
                          <Badge variant="destructive" className="h-4 text-[10px] px-1">
                            *
                          </Badge>
                        )}
                        <Badge variant="outline" className="h-4 text-[10px] px-1">
                          {config?.[field.name]?.type || field.type}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                  {showActions && (
                    <TableHead className="w-24 text-center">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginationData.paginatedData.map((record, index) => (
                  <TableRow key={generateRecordKey(record, index)} className="group">
                    {sortedFields.map(field => (
                      <TableCell 
                        key={field.name}
                        className={`${
                          config?.[field.name]?.align === 'center' ? 'text-center' :
                          config?.[field.name]?.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div 
                          className="max-w-xs truncate font-mono text-sm" 
                          title={JSON.stringify(record[field.name])}
                        >
                          {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                        </div>
                      </TableCell>
                    ))}
                    {showActions && (
                      <TableCell className="text-center">
                        <ActionButtons
                          record={record}
                          index={index}
                          generalConfig={generalConfig}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          deletingIndex={deletingIndex}
                          createActionHandler={createActionHandler}
                          size="sm"
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {renderPagination()}
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
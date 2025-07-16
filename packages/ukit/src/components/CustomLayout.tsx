import React, { useState, useMemo } from "react";
import { LayoutProps } from "../types";
import { getSortedFields, generateRecordKey } from "../utils";
import { useLayoutActions } from "../hooks/useLayoutActions";
import { CommonModals } from "./common/CommonModals";
import { EmptyState } from "./common/EmptyState";
import { LayoutHeader } from "./common/LayoutHeader";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Extended LayoutProps to include custom render functionality
interface ExtendedLayoutProps extends LayoutProps {
  // Custom render function
  render?: (data: any[], options: {
    fields: any[];
    config: any;
    generalConfig: any;
    onEdit: (record: any, index: number) => void;
    onDelete: (record: any, index: number) => void;
    createActionHandler: (action: any, record: any, index: number) => () => Promise<void>;
    deletingIndex: number | null;
    currentPage: number;
    pageSize: number;
    startIndex: number;
    endIndex: number;
    totalRecords: number;
  }) => React.ReactNode;
  
  // Pagination props
  enablePagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  
  // Add Record props
  showAddButton?: boolean;
  onAddRecord?: (record: any) => Promise<void>;
  
  // General controls
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
 * Custom layout component that allows custom rendering via render callback
 */
export const CustomLayout: React.FC<ExtendedLayoutProps> = ({ 
  entity, 
  data, 
  config,
  generalConfig,
  onEdit,
  onDelete,
  // Custom render function
  render,
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
          viewName="Custom"
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

  // Default render function if none provided
  const defaultRender = (data: any[], options: any) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((record, index) => (
        <Card 
          key={generateRecordKey(record, index)} 
          className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg"
        >
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {(options.startIndex + index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold">{entity.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Record #{options.startIndex + index + 1}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {options.fields.slice(0, 3).map((field: any) => (
                  <div key={field.name} className="space-y-1">
                    <span className="text-sm font-medium">
                      {options.config?.[field.name]?.label || field.name}
                    </span>
                    <div className="text-sm text-muted-foreground break-words">
                      {String(record[field.name] || '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

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
          viewName="custom"
          showFilter={showFilter}
          filterConfig={filterConfig}
          onFilteredDataChange={setFilteredData}
        />

        {/* Custom Content */}
        <Card>
          <div className="p-6">
            {(render || defaultRender)(paginationData.paginatedData, {
              fields: sortedFields,
              config,
              generalConfig,
              onEdit: handleEdit,
              onDelete: handleDelete,
              createActionHandler,
              deletingIndex,
              currentPage: paginationData.adjustedPage || activePage,
              pageSize,
              startIndex: paginationData.startIndex,
              endIndex: paginationData.endIndex,
              totalRecords: paginationData.totalRecords,
            })}
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
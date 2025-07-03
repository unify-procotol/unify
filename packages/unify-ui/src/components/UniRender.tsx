import React from "react";
import { UniRenderProps } from "../types";
import { TableLayout } from "./TableLayout";
import { FormLayout } from "./FormLayout";
import { CardLayout } from "./CardLayout";
import { GridLayout } from "./GridLayout";
import { ListLayout } from "./ListLayout";
import { DashboardLayout } from "./DashboardLayout";

/**
 * Main UniRender component for rendering data in various layouts
 */
export const UniRender: React.FC<UniRenderProps> = ({
  entity,
  data,
  layout,
  config,
  generalConfig,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  onSave,
  className = ""
}) => {
  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-gray-600 font-medium">Loading data...</div>
        <div className="text-gray-400 text-sm mt-1">Please wait while we fetch your {entity.name.toLowerCase()} data</div>
      </div>
    </div>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 text-red-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <div className="text-red-600 text-lg font-semibold mb-2">Oops! Something went wrong</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div className="text-gray-600 text-lg font-medium mb-2">No data found</div>
        <p className="text-gray-500 mb-4">No records found for {entity.name}</p>
        {onAdd && (
          <button 
            onClick={() => onAdd({})}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add First Record
          </button>
        )}
      </div>
    </div>
  );

  /**
   * Render the appropriate layout component
   */
  const renderLayout = () => {
    const layoutProps = {
      entity,
      data,
      config,
      generalConfig,
      onEdit,
      onDelete,
      onSave
    };

    switch (layout) {
      case 'table':
        return <TableLayout {...layoutProps} />;
      case 'form':
        return <FormLayout {...layoutProps} />;
      case 'card':
        return <CardLayout {...layoutProps} />;
      case 'grid':
        return <GridLayout {...layoutProps} />;
      case 'list':
        return <ListLayout {...layoutProps} />;
      case 'dashboard':
        return <DashboardLayout {...layoutProps} />;
      default:
        console.warn(`Unknown layout type: ${layout}. Falling back to table layout.`);
        return <TableLayout {...layoutProps} />;
    }
  };

  // Handle different states
  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  if (!data || data.length === 0) {
    return renderEmptyState();
  }

  // Render the main content
  return (
    <div className={`unify-ui-render ${className}`}>
      {renderLayout()}
    </div>
  );
}; 
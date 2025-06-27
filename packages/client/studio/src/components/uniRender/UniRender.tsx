import React from "react";
import { UniRenderProps } from "./types";
import { TableLayout } from "./components/TableLayout";
import { FormLayout } from "./components/FormLayout";
import { CardLayout } from "./components/CardLayout";
import { GridLayout } from "./components/GridLayout";
import { ListLayout } from "./components/ListLayout";
import { DashboardLayout } from "./components/DashboardLayout";

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
  className
}) => {
  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className || ''}`}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <div className="text-gray-400">Loading data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 ${className || ''}`}>
        <div className="text-center max-w-md">
          <div className="text-red-400 text-lg font-medium mb-2">Error</div>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className || ''}`}>
        <div className="text-center">
          <div className="text-gray-400 text-lg font-medium mb-2">No Data</div>
          <p className="text-gray-500">No records found for {entity.name}</p>
        </div>
      </div>
    );
  }

  // Render the appropriate layout
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
        return <TableLayout {...layoutProps} />;
    }
  };

  return (
    <div className={className}>
      {renderLayout()}
    </div>
  );
}; 
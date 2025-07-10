import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { repo } from "@unilab/urpc";
import { UniRenderProps, Entity } from "../types";
import { TableLayout } from "./TableLayout";
import { FormLayout } from "./FormLayout";
import { CardLayout } from "./CardLayout";
import { GridLayout } from "./GridLayout";
import { ListLayout } from "./ListLayout";
import { DashboardLayout } from "./DashboardLayout";

/**
 * Check if we're running on the client side
 */
const isClientSide = () => typeof window !== 'undefined';

/**
 * Generate a default entity schema when global schema is not available
 */
const generateDefaultEntitySchema = (entityName: string, sampleData: any[]): Entity => {
  const fields = [];
  
  if (sampleData && sampleData.length > 0) {
    const firstRecord = sampleData[0];
    
    // Generate fields from sample data
    for (const [key, value] of Object.entries(firstRecord)) {
      let type = 'string';
      
      if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
        type = 'date';
      } else if (Array.isArray(value)) {
        type = 'array';
      } else if (typeof value === 'object' && value !== null) {
        type = 'object';
      }
      
      fields.push({
        name: key,
        type: type,
        required: value !== null && value !== undefined,
        description: `${key} field`
      });
    }
  }
  
  return {
    name: entityName,
    fields: fields,
    schema: {
      type: 'object',
      properties: {},
      required: []
    }
  };
};

/**
 * Export interface for ref methods
 */
export interface UniRenderRef {
  refresh: () => Promise<void>;
  refreshData: () => Promise<void>;
  refreshSchema: () => Promise<void>;
}

/**
 * Main UniRender component for rendering data in various layouts
 */
export const UniRender = forwardRef<UniRenderRef, UniRenderProps>(({
  entity: entityName,
  source,
  query = {},
  layout,
  config,
  generalConfig,
  loading: externalLoading,
  error: externalError,
  onAdd,
  onEdit,
  onDelete,
  onSave,
  className = "",
}, ref) => {
  const [data, setData] = useState<any[]>([]);
  const [entitySchema, setEntitySchema] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch entity schema from global schema with fallback to default generation
  const fetchEntitySchema = async (sampleData?: any[]) => {
    // Only fetch schema on client side to avoid SSR issues
    if (!isClientSide()) {
      // For SSR, wait for data to be available before generating schema
      return;
    }

    try {
      // Try to get specific entity schema from global schema
      const schemaResponse = await repo({
        entity: "schema",
        source: "_global",
      }).findOne({
        where: {
          name: entityName,
        },
      });
      
      if (schemaResponse && schemaResponse.schema) {
        // Convert schema.properties to fields array for UniRender
        const fields = [];
        const properties = schemaResponse.schema.properties || {};
        const required = schemaResponse.schema.required || [];
        
        for (const [fieldName, fieldDef] of Object.entries(properties)) {
          const fieldInfo = fieldDef as any;
          
          // Skip relation fields (arrays with entity types or direct entity references)
          const isRelationField = 
            (fieldInfo.type === 'array' && fieldInfo.items?.type?.endsWith?.('Entity')) ||
            (typeof fieldInfo.type === 'string' && fieldInfo.type.endsWith('Entity'));
          
          if (!isRelationField) {
            fields.push({
              name: fieldName,
              type: fieldInfo.type === 'array' ? 'array' : fieldInfo.type || 'string',
              required: required.includes(fieldName),
              description: fieldInfo.description || `${fieldName} field`
            });
          }
        }
        
        setEntitySchema({
          name: schemaResponse.name,
          fields: fields,
          schema: schemaResponse.schema,
        });
      } else {
        // Don't generate default schema immediately if we don't have data
        // Let fetchData handle schema generation based on actual data
        if (sampleData && sampleData.length > 0) {
          console.warn(`Entity "${entityName}" not found in global schema, generating default schema from data`);
          const defaultSchema = generateDefaultEntitySchema(entityName, sampleData);
          setEntitySchema(defaultSchema);
        }
      }
    } catch (err) {
      // Don't generate default schema immediately if we don't have data
      // Let fetchData handle schema generation based on actual data
      if (sampleData && sampleData.length > 0) {
        console.warn(`Failed to fetch entity schema: ${err}, generating default schema from data`);
        const defaultSchema = generateDefaultEntitySchema(entityName, sampleData);
        setEntitySchema(defaultSchema);
      }
    }
  };

  // Fetch data based on layout type (separated from schema fetching)
  const fetchData = async () => {
    // Only fetch data on client side to avoid SSR issues
    if (!isClientSide()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const repoInstance = repo({
        entity: entityName,
        source: source,
      });

      let result;
      // For form layout, use findOne if query has specific ID
      if (layout === 'form' && query.where?.id) {
        result = await repoInstance.findOne(query as any);
        const resultData = result ? [result] : [];
        setData(resultData);
        
        // Generate schema based on actual data if no schema exists or schema is empty
        if (!entitySchema || !entitySchema.fields || entitySchema.fields.length === 0) {
          const dataBasedSchema = generateDefaultEntitySchema(entityName, resultData);
          setEntitySchema(dataBasedSchema);
        }
      } else {
        // For other layouts, use findMany
        result = await repoInstance.findMany(query as any);
        const resultData = result || [];
        setData(resultData);
        
        // Generate schema based on actual data if no schema exists or schema is empty
        if (!entitySchema || !entitySchema.fields || entitySchema.fields.length === 0) {
          const dataBasedSchema = generateDefaultEntitySchema(entityName, resultData);
          setEntitySchema(dataBasedSchema);
        }
      }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to fetch data: ${errorMessage}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    refresh: async () => {
      await Promise.all([fetchEntitySchema(data), fetchData()]);
    },
    refreshData: async () => {
      await fetchData();
    },
    refreshSchema: async () => {
      await fetchEntitySchema(data);
    },
  }), [entityName, source, data]);

  // Initial setup - fetch schema and data separately
  useEffect(() => {
    fetchEntitySchema();
  }, [entityName]);

  useEffect(() => {
    // Only fetch data when we're on client side
    if (isClient) {
      fetchData();
    }
  }, [entityName, source, JSON.stringify(query), isClient]);

  // Use external loading/error states if provided
  const isLoading = externalLoading !== undefined ? externalLoading : loading;
  const currentError = externalError !== undefined ? externalError : error;

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-gray-600 font-medium">Loading data...</div>
        <div className="text-gray-400 text-sm mt-1">
          Please wait while we fetch your {entityName} data
        </div>
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
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="text-red-600 text-lg font-semibold mb-2">
          Oops! Something went wrong
        </div>
        <p className="text-gray-600 mb-4">{currentError}</p>
        <button
          onClick={() => {
            setError(null);
            fetchData();
          }}
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
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="text-gray-600 text-lg font-medium mb-2">
          No data found
        </div>
        <p className="text-gray-500 mb-4">No records found for {entityName}</p>
        {onAdd && (
          <button
            onClick={() => onAdd({})}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm inline-flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
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
    if (!entitySchema) return null;

    const layoutProps = {
      entity: entitySchema,
      data,
      config,
      generalConfig,
      onEdit,
      onDelete,
      onSave,
    };

    switch (layout) {
      case "table":
        return <TableLayout {...layoutProps} />;
      case "form":
        return <FormLayout {...layoutProps} />;
      case "card":
        return <CardLayout {...layoutProps} />;
      case "grid":
        return <GridLayout {...layoutProps} />;
      case "list":
        return <ListLayout {...layoutProps} />;
      case "dashboard":
        return <DashboardLayout {...layoutProps} />;
      default:
        console.warn(
          `Unknown layout type: ${layout}. Falling back to table layout.`
        );
        return <TableLayout {...layoutProps} />;
    }
  };

  // Handle different states
  // For SSR, show loading state until client-side hydration
  if (!isClient) {
    return renderLoadingState();
  }

  if (isLoading) {
    return renderLoadingState();
  }

  if (currentError) {
    return renderErrorState();
  }

  if (!entitySchema) {
    return renderLoadingState();
  }

  if (!data || data.length === 0) {
    return renderEmptyState();
  }

  // Render the main content
  return <div className={`ukit-render ${className}`}>{renderLayout()}</div>;
});

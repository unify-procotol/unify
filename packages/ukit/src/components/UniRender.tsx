import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
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
const isClientSide = () => typeof window !== "undefined";

/**
 * Generate a default entity schema when global schema is not available
 */
const generateDefaultEntitySchema = (
  entityName: string,
  sampleData: any[]
): Entity => {
  const fields = [];

  if (sampleData && sampleData.length > 0) {
    const firstRecord = sampleData[0];

    // Generate fields from sample data
    for (const [key, value] of Object.entries(firstRecord)) {
      let type = "string";

      if (typeof value === "number") {
        type = "number";
      } else if (typeof value === "boolean") {
        type = "boolean";
      } else if (
        value instanceof Date ||
        (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value))
      ) {
        type = "date";
      } else if (Array.isArray(value)) {
        type = "array";
      } else if (typeof value === "object" && value !== null) {
        type = "object";
      }

      fields.push({
        name: key,
        type: type,
        required: value !== null && value !== undefined,
        description: `${key} field`,
      });
    }
  } else {
    if (entityName.toLowerCase().includes("todo")) {
      fields.push(
        {
          name: "id",
          type: "string",
          required: true,
          description: "Unique identifier",
        },
        {
          name: "title",
          type: "string",
          required: true,
          description: "Todo title",
        },
        {
          name: "completed",
          type: "boolean",
          required: false,
          description: "Completion status",
        }
      );
    } else {
      fields.push(
        {
          name: "id",
          type: "string",
          required: true,
          description: "Unique identifier",
        },
        {
          name: "name",
          type: "string",
          required: true,
          description: "Name field",
        },
        {
          name: "description",
          type: "string",
          required: false,
          description: "Description field",
        }
      );
    }
  }

  return {
    name: entityName,
    fields: fields,
    schema: {
      type: "object",
      properties: {},
      required: [],
    },
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
export const UniRender = forwardRef<UniRenderRef, UniRenderProps>(
  (
    {
      entity: entityInput,
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
    },
    ref
  ) => {
    const [data, setData] = useState<any[]>([]);
    const [entitySchema, setEntitySchema] = useState<Entity | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    const isEntityClass = typeof entityInput != "string";
    const entityName = isEntityClass
      ? entityInput.name || "Entity"
      : entityInput;
    const entityClass = isEntityClass ? entityInput : null;

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
        const schemaResponse = await repo({
          entity: "schema",
          source: "_global",
        }).findOne({
          where: {
            name: entityName,
          },
        });

        if (schemaResponse && schemaResponse.schema) {
          const fields = [];
          const properties = schemaResponse.schema.properties || {};
          const required = schemaResponse.schema.required || [];

          for (const [fieldName, fieldDef] of Object.entries(properties)) {
            const fieldInfo = fieldDef as any;

            const isRelationField =
              (fieldInfo.type === "array" &&
                fieldInfo.items?.type?.endsWith?.("Entity")) ||
              (typeof fieldInfo.type === "string" &&
                fieldInfo.type.endsWith("Entity"));

            if (!isRelationField) {
              const newField = {
                name: fieldName,
                type:
                  fieldInfo.type === "array"
                    ? "array"
                    : fieldInfo.type || "string",
                required: required.includes(fieldName),
                description: fieldInfo.description || `${fieldName} field`,
              };
              fields.push(newField);
            }
          }

          if (fields.length === 0) {
            fields.push(
              {
                name: "id",
                type: "string",
                required: true,
                description: "Unique identifier",
              },
              {
                name: "title",
                type: "string",
                required: true,
                description: "Title field",
              },
              {
                name: "completed",
                type: "boolean",
                required: false,
                description: "Completion status",
              }
            );
          }

          setEntitySchema({
            name: schemaResponse.name,
            fields: fields,
            schema: schemaResponse.schema,
          });
        } else {
          const defaultSchema = generateDefaultEntitySchema(
            entityName,
            sampleData || []
          );
          setEntitySchema(defaultSchema);
        }
      } catch (err) {
        const defaultSchema = generateDefaultEntitySchema(
          entityName,
          sampleData || []
        );
        setEntitySchema(defaultSchema);
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
          entity: entityClass || entityName,
          source: source,
        });

        let result;
        // For form layout, use findOne if query has specific ID
        if (layout === "form" && query.where?.id) {
          result = await repoInstance.findOne(query as any);
          const resultData = result ? [result] : [];
          setData(resultData);

          // Generate schema based on actual data if no schema exists or schema is empty
          if (
            !entitySchema ||
            !entitySchema.fields ||
            entitySchema.fields.length === 0
          ) {
            const dataBasedSchema = generateDefaultEntitySchema(
              entityName,
              resultData
            );
            setEntitySchema(dataBasedSchema);
          }
        } else {
          // For other layouts, use findMany
          result = await repoInstance.findMany(query as any);
          const resultData = result || [];
          setData(resultData);

          // Generate schema based on actual data if no schema exists or schema is empty
          if (
            !entitySchema ||
            !entitySchema.fields ||
            entitySchema.fields.length === 0
          ) {
            const dataBasedSchema = generateDefaultEntitySchema(
              entityName,
              resultData
            );
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
    useImperativeHandle(
      ref,
      () => ({
        refresh: async () => {
          await Promise.all([fetchEntitySchema(data), fetchData()]);
        },
        refreshData: async () => {
          await fetchData();
        },
        refreshSchema: async () => {
          await fetchEntitySchema(data);
        },
      }),
      [entityName, source, data]
    );

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
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-foreground font-medium">Loading data...</div>
          <div className="text-muted-foreground text-sm mt-1">
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
          <div className="text-destructive text-lg font-semibold mb-2">
            Oops! Something went wrong
          </div>
          <p className="text-muted-foreground mb-4">{currentError}</p>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );

    /**
     * Handle add record functionality
     */
    const handleAddRecord = async (newRecord: any) => {
      try {
        await repo({
          entity: entityClass || entityName,
          source: source,
        }).create({
          data: newRecord,
        });

        await fetchData();
      } catch (error) {
        throw error;
      }
    };

    /**
     * Handle edit record functionality
     */
    const handleEditRecord = async (updatedRecord: any, index: number) => {
      if (onEdit) {
        await onEdit(updatedRecord, index);
      } else {
        try {
          await repo({
            entity: entityClass || entityName,
            source: source,
          }).update({
            where: { id: updatedRecord.id },
            data: updatedRecord,
          });

          await fetchData();
        } catch (error) {
          throw error;
        }
      }
    };

    /**
     * Handle delete record functionality
     */
    const handleDeleteRecord = async (record: any, index: number) => {
      try {
        await repo({
          entity: entityName,
          source: source,
        }).delete({
          where: { id: record.id },
        });
        await fetchData();
        onDelete?.(record, index);
      } catch (error) {
        throw error;
      }
    };

    /**
     * Render the appropriate layout component
     */
    const renderLayout = () => {
      if (!entitySchema) return null;

      const getEntityInstance = async (record: any) => {
        if (!entityClass) {
          return null;
        }

        const repoInstance = repo({
          entity: entityClass,
          source: source,
        });

        const entityInstance = await repoInstance.findOne({
          where: { id: record.id },
        });
        return entityInstance;
      };

      const layoutProps = {
        entity: entitySchema,
        data,
        config,
        generalConfig,
        onEdit: handleEditRecord,
        onDelete: handleDeleteRecord,
        onSave,
      };

      // Get common configuration for all layouts
      const commonConfig = {
        showAddButton: generalConfig?.showAddButton ?? true,
        showTopControls: generalConfig?.showTopControls ?? true,
        onAddRecord: handleAddRecord,
        entityInstance: getEntityInstance,
        onRefresh: fetchData,
      };

      // Get table-specific configuration
      const tableConfig = generalConfig?.table || {};
      const {
        enablePagination = true,
        pageSize = 10,
        showAddButton: tableShowAddButton,
        showTopControls: tableShowTopControls,
      } = tableConfig;

      // Table layout uses specific config if provided, otherwise uses common config
      const tableExtendedConfig = {
        ...commonConfig,
        showAddButton: tableShowAddButton ?? commonConfig.showAddButton,
        showTopControls: tableShowTopControls ?? commonConfig.showTopControls,
        entityInstance: getEntityInstance,
        onRefresh: fetchData,
      };

      switch (layout) {
        case "table":
          return (
            <TableLayout
              {...layoutProps}
              {...tableExtendedConfig}
              enablePagination={enablePagination}
              pageSize={pageSize}
            />
          );
        case "form":
          return <FormLayout {...layoutProps} />;
        case "card":
          return <CardLayout {...layoutProps} {...commonConfig} />;
        case "grid":
          return <GridLayout {...layoutProps} {...commonConfig} />;
        case "list":
          return <ListLayout {...layoutProps} {...commonConfig} />;
        case "dashboard":
          return <DashboardLayout {...layoutProps} />;
        default:
          return (
            <TableLayout
              {...layoutProps}
              {...tableExtendedConfig}
              enablePagination={enablePagination}
              pageSize={pageSize}
            />
          );
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

    // Always render the layout component, let it handle empty state
    // Render the main content
    return (
      <>
        <div className={`ukit-render ${className}`}>{renderLayout()}</div>
      </>
    );
  }
);

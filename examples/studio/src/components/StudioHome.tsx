import { useState, useEffect } from "react";
import { repo, URPC } from "@unilab/urpc-client";
import { UniRender, Entity, LayoutType, FieldConfig } from "@unilab/urpc-ui";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

// Entity schema type based on the API response
interface Schema {
  name: string;
  schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  sources?: string[];
}

interface SourceData {
  entity: string;
  source: string;
  data: any[];
  loading: boolean;
  error: string | null;
}

interface StudioHomeProps {
  isConnected: boolean;
  baseUrl: string;
}

export function StudioHome({ isConnected, baseUrl }: StudioHomeProps) {
  const [entities, setEntities] = useState<Schema[]>([]);
  const [sourceDataList, setSourceDataList] = useState<SourceData[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Schema | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "json" | "unirender">(
    "table"
  );
  const [uniRenderLayout, setUniRenderLayout] = useState<LayoutType>("table");
  const [collapsedEntities, setCollapsedEntities] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query and search state
  const [searchField, setSearchField] = useState<string>("");
  const [searchOperator, setSearchOperator] = useState<
    | "contains"
    | "equals"
    | "startsWith"
    | "endsWith"
    | "gt"
    | "lt"
    | "gte"
    | "lte"
  >("contains");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  // Add row state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [addLoading, setAddLoading] = useState(false);

  // Load entities when connection status or baseUrl changes
  useEffect(() => {
    if (isConnected) {
      loadEntities();
    } else {
      // Reset state when disconnected
      setEntities([]);
      setSourceDataList([]);
      setSelectedEntity(null);
      setSelectedSource("");
      setLoading(false);
      setError("Not connected to server");
    }
  }, [isConnected, baseUrl]);

  const loadEntities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the same API call as examples/global/client.ts
      const entitiesInfo = await repo<Schema>({
        entity: "schema",
        source: "_global",
      }).findMany();
      setEntities(entitiesInfo);

      if (entitiesInfo.length > 0) {
        setSelectedEntity(entitiesInfo[0]);
        if (entitiesInfo[0].sources && entitiesInfo[0].sources.length > 0) {
          setSelectedSource(entitiesInfo[0].sources[0]);
        }
        // Ensure the first entity is expanded by default
        setCollapsedEntities(new Set());
      }

      // Initialize source data state for each entity-source combination
      const initialSourceData: SourceData[] = [];
      entitiesInfo.forEach((entity: Schema) => {
        if (entity.sources && entity.sources.length > 0) {
          entity.sources.forEach((source: string) => {
            initialSourceData.push({
              entity: entity.name,
              source: source,
              data: [],
              loading: true, // Set to true to start loading immediately
              error: null,
            });
          });
        }
      });
      setSourceDataList(initialSourceData);

      // Auto-load all source data
      await loadAllSourceData(entitiesInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entities");
    } finally {
      setLoading(false);
    }
  };

  const loadAllSourceData = async (entitiesInfo: Schema[]) => {
    // Create all loading promises
    const loadingPromises: Promise<void>[] = [];

    entitiesInfo.forEach((entity) => {
      if (entity.sources && entity.sources.length > 0) {
        entity.sources.forEach((source) => {
          const promise = loadSingleSourceData(entity.name, source);
          loadingPromises.push(promise);
        });
      }
    });

    // Wait for all data to load in parallel
    await Promise.allSettled(loadingPromises);
  };

  const loadSingleSourceData = async (
    entity: string,
    source: string
  ): Promise<void> => {
    try {
      // Convert entity name to repo name format (e.g., "UserEntity" -> "user")
      const data = await repo<any>({
        entity: entity,
        source: source,
      }).findMany();

      setSourceDataList((prev) =>
        prev.map((item) =>
          item.entity === entity && item.source === source
            ? { ...item, data, loading: false }
            : item
        )
      );
    } catch (err) {
      setSourceDataList((prev) =>
        prev.map((item) =>
          item.entity === entity && item.source === source
            ? {
                ...item,
                loading: false,
                error:
                  err instanceof Error ? err.message : "Failed to load data",
              }
            : item
        )
      );
    }
  };

  const getCurrentSourceData = (): SourceData | undefined => {
    if (!selectedEntity || !selectedSource) return undefined;
    return sourceDataList.find(
      (item) =>
        item.entity === selectedEntity.name &&
        item.source === selectedSource
    );
  };

  const toggleEntityCollapse = (entity: string) => {
    setCollapsedEntities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entity)) {
        newSet.delete(entity);
      } else {
        newSet.add(entity);
      }
      return newSet;
    });
  };

  const isEntityCollapsed = (entity: string) =>
    collapsedEntities.has(entity);

  // Execute search query on backend
  const executeSearch = async () => {
    if (!selectedEntity || !selectedSource) return;

    setIsSearching(true);
    try {
      const entityName = selectedEntity.name;

      // Build query parameters based on search criteria using proper urpc syntax
      let findManyArgs: any = {};

      if (searchField && searchValue.trim()) {
        const whereCondition: any = {};

        // Build the query based on operator
        switch (searchOperator) {
          case "contains":
            // For string contains, we might need to use a different approach
            // Since urpc might not support regex, we'll use equals for now
            whereCondition[searchField] = searchValue;
            break;
          case "equals":
            whereCondition[searchField] = searchValue;
            break;
          case "startsWith":
            // For startsWith, we'll also use equals for now
            whereCondition[searchField] = searchValue;
            break;
          case "endsWith":
            // For endsWith, we'll also use equals for now
            whereCondition[searchField] = searchValue;
            break;
          case "gt":
            whereCondition[searchField] = {
              $gt: isNaN(Number(searchValue))
                ? searchValue
                : Number(searchValue),
            };
            break;
          case "lt":
            whereCondition[searchField] = {
              $lt: isNaN(Number(searchValue))
                ? searchValue
                : Number(searchValue),
            };
            break;
          case "gte":
            whereCondition[searchField] = {
              $gte: isNaN(Number(searchValue))
                ? searchValue
                : Number(searchValue),
            };
            break;
          case "lte":
            whereCondition[searchField] = {
              $lte: isNaN(Number(searchValue))
                ? searchValue
                : Number(searchValue),
            };
            break;
        }

        findManyArgs = {
          where: whereCondition,
        };
      }

      console.log("findManyArgs:", findManyArgs);

      // Call the backend with proper urpc query syntax
      const searchResults =
        Object.keys(findManyArgs).length > 0
          ? await repo<any>({
              entity: entityName,
              source: selectedSource,
            }).findMany(findManyArgs)
          : await repo<any>({
              entity: entityName,
              source: selectedSource,
            }).findMany();

      // Update the source data with search results
      setSourceDataList((prev) =>
        prev.map((item) =>
          item.entity === selectedEntity.name &&
          item.source === selectedSource
            ? { ...item, data: searchResults, loading: false }
            : item
        )
      );
    } catch (err) {
      setSourceDataList((prev) =>
        prev.map((item) =>
          item.entity === selectedEntity.name &&
          item.source === selectedSource
            ? {
                ...item,
                loading: false,
                error: err instanceof Error ? err.message : "Search failed",
              }
            : item
        )
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Get available fields for filtering from current entity schema
  const getAvailableFields = (): string[] => {
    if (!selectedEntity?.schema?.properties) return [];
    return Object.keys(selectedEntity.schema.properties);
  };

  // Add new row functionality
  const handleAddRow = () => {
    if (!selectedEntity) return;

    // Initialize form with empty values based on entity schema
    const initialData: Record<string, any> = {};
    if (selectedEntity.schema && selectedEntity.schema.properties) {
      Object.keys(selectedEntity.schema.properties).forEach((key) => {
        const property = selectedEntity.schema.properties[key];
        if (property.type === "string") {
          initialData[key] = "";
        } else if (property.type === "number") {
          initialData[key] = 0;
        } else if (property.type === "boolean") {
          initialData[key] = false;
        } else {
          initialData[key] = "";
        }
      });
    }

    setNewRowData(initialData);
    setShowAddForm(true);
  };

  const handleSaveRow = async () => {
    if (!selectedEntity || !selectedSource) return;

    setAddLoading(true);
    try {
      const entity = selectedEntity.name;

      // Create new record using urpc client
      await repo<any>({
        entity: entity,
        source: selectedSource,
      }).create({ data: newRowData });

      // Reload data to show the new record
      await loadSingleSourceData(selectedEntity.name, selectedSource);

      // Close form and reset
      setShowAddForm(false);
      setNewRowData({});
    } catch (err) {
      console.error("Failed to add row:", err);
      // You might want to show an error message here
    } finally {
      setAddLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewRowData({});
  };

  const handleInputChange = (field: string, value: any) => {
    setNewRowData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset search when entity or source changes and reload data
  useEffect(() => {
    setSearchField("");
    setSearchValue("");
    // Reload original data when switching entity/source
    if (selectedEntity && selectedSource) {
      loadSingleSourceData(selectedEntity.name, selectedSource);
    }
  }, [selectedEntity, selectedSource]);

  // Convert Schema to UniRender Entity format
  const convertToUniRenderEntity = (Schema: Schema): Entity => {
    const fields =
      Schema.schema && Schema.schema.properties
        ? Object.entries(Schema.schema.properties).map(([name, property]) => ({
            name,
            type: property.type || "string",
            required: Schema.schema.required.includes(name),
            description: property.description,
          }))
        : [];

    return {
      name: Schema.name,
      fields,
      schema: Schema.schema,
    };
  };

  // Example field configuration with custom rendering and ordering
  const getFieldConfig = (entity: string): Record<string, FieldConfig> => {
    // You can customize this based on different entities
    const baseConfig: Record<string, FieldConfig> = {};

    // Example configurations for different field types
    if (entity.toLowerCase().includes("user")) {
      return {
        id: { order: 1, label: "ID", width: "80px", align: "center" },
        name: { order: 2, label: "Full Name", width: "150px" },
        email: {
          order: 3,
          label: "Email Address",
          render: (value) => (
            <a
              href={`mailto:${value}`}
              className="text-blue-400 hover:underline"
            >
              {value}
            </a>
          ),
        },
        age: {
          order: 4,
          label: "Age",
          align: "center",
          render: (value) => (
            <span
              className={`px-2 py-1 rounded text-xs ${
                value >= 18
                  ? "bg-green-600/20 text-green-400"
                  : "bg-yellow-600/20 text-yellow-400"
              }`}
            >
              {value}
            </span>
          ),
        },
        createdAt: {
          order: 5,
          label: "Created",
          render: (value) => (
            <span className="text-cyan-400">
              {new Date(value).toLocaleDateString()}
            </span>
          ),
        },
      };
    }

    // Default configuration for other entities
    return baseConfig;
  };

  const formatJsonValue = (value: any, depth = 0): JSX.Element => {
    const indent = "  ".repeat(depth);

    if (value === null)
      return <span className="text-muted-foreground">null</span>;
    if (typeof value === "string")
      return (
        <span className="text-green-600 dark:text-green-400">"{value}"</span>
      );
    if (typeof value === "number")
      return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    if (typeof value === "boolean")
      return (
        <span className="text-purple-600 dark:text-purple-400">
          {value.toString()}
        </span>
      );

    if (Array.isArray(value)) {
      return (
        <div>
          <span className="text-foreground">[</span>
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {formatJsonValue(item, depth + 1)}
              {index < value.length - 1 && (
                <span className="text-foreground">,</span>
              )}
            </div>
          ))}
          <span className="text-foreground">]</span>
        </div>
      );
    }

    if (typeof value === "object") {
      const entries = Object.entries(value);
      return (
        <div>
          <span className="text-foreground">{"{"}</span>
          {entries.map(([key, val], index) => (
            <div key={key} className="ml-4">
              <span className="text-orange-600 dark:text-orange-400">
                "{key}"
              </span>
              <span className="text-foreground">: </span>
              {formatJsonValue(val, depth + 1)}
              {index < entries.length - 1 && (
                <span className="text-foreground">,</span>
              )}
            </div>
          ))}
          <span className="text-foreground">{"}"}</span>
        </div>
      );
    }

    return <span className="text-foreground">{String(value)}</span>;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin mx-auto mb-3 border-2 border-primary border-t-transparent rounded-full"></div>
            <div className="text-muted-foreground">Loading entities...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <div className="text-destructive text-lg font-medium mb-2">
              Error
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadEntities} variant="default">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentSourceData = getCurrentSourceData();

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-border flex flex-col overflow-hidden">
        {/* Entities and Data Sources Tree */}
        <div className="flex-1 overflow-auto">
          <Card className="h-10 rounded-none border-x-0 border-t-0 flex items-center px-4">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"
                />
              </svg>
              <span className="text-sm font-medium text-foreground">
                Database Explorer
              </span>
            </div>
          </Card>
          <div className="p-4">
            <div className="space-y-2">
              {entities.map((entity) => {
                const isCollapsed = isEntityCollapsed(entity.name);
                const isSelected = selectedEntity?.name === entity.name;
                return (
                  <Card key={entity.name} className="overflow-hidden">
                    {/* Entity Header */}
                    <Button
                      variant={isSelected ? "default" : "ghost"}
                      onClick={() => {
                        if (isSelected) {
                          // If already selected, just toggle collapse
                          toggleEntityCollapse(entity.name);
                        } else {
                          // If not selected, select and expand
                          setSelectedEntity(entity);
                          // Ensure it's expanded when selected
                          if (isCollapsed) {
                            toggleEntityCollapse(entity.name);
                          }
                        }
                      }}
                      className={cn(
                        "w-full justify-between h-auto px-3 py-2",
                        isCollapsed
                          ? "rounded-lg"
                          : "rounded-t-lg rounded-b-none"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <span className="font-medium">{entity.name}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transform transition-transform ${
                          isCollapsed ? "rotate-0" : "rotate-90"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>

                    {/* Entity Details and Data Sources */}
                    {!isCollapsed && (
                      <CardContent className="p-0 bg-muted/50 rounded-b-lg">
                        {/* Schema Info */}
                        <div className="px-3 py-2 border-b border-border">
                          <Badge variant="outline" className="text-xs">
                            Required: {entity.schema.required.join(", ")}
                          </Badge>
                        </div>

                        {/* Data Sources */}
                        {entity.sources && entity.sources.length > 0 && (
                          <div className="px-3 py-2">
                            <div className="text-xs text-muted-foreground mb-2 flex items-center space-x-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 11l3 3 4-4"
                                />
                              </svg>
                              <span>Data Sources</span>
                            </div>
                            <div className="space-y-1 ml-4">
                              {entity.sources.map((source) => {
                                const isSourceActive =
                                  selectedSource === source &&
                                  selectedEntity?.name === entity.name;
                                const sourceStatus = sourceDataList.find(
                                  (item) =>
                                    item.entity === entity.name &&
                                    item.source === source
                                );
                                return (
                                  <Button
                                    key={source}
                                    variant={
                                      isSourceActive ? "default" : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEntity(entity);
                                      setSelectedSource(source);
                                    }}
                                    className="w-full justify-between h-8 px-3 py-1 text-xs"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                      </svg>
                                      <span className="capitalize">
                                        {source}
                                      </span>
                                    </div>
                                    <div
                                      className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        sourceStatus?.loading &&
                                          "bg-yellow-400",
                                        sourceStatus?.error && "bg-destructive",
                                        !sourceStatus?.loading &&
                                          !sourceStatus?.error &&
                                          "bg-green-500"
                                      )}
                                    ></div>
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Data View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Entity Tabs */}
        <Card className="h-12 rounded-none border-x-0 border-t-0 flex items-center px-4">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {entities.map((entity) => (
              <Button
                key={entity.name}
                variant={
                  selectedEntity?.name === entity.name ? "default" : "ghost"
                }
                size="sm"
                onClick={() => {
                  setSelectedEntity(entity);
                  if (entity.sources && entity.sources.length > 0) {
                    setSelectedSource(entity.sources[0]);
                  }
                }}
                className="whitespace-nowrap"
              >
                {entity.name}
              </Button>
            ))}
          </div>
        </Card>

        {/* Breadcrumb and View Controls */}
        <Card className="h-10 rounded-none border-x-0 border-t-0 flex items-center justify-between px-4">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"
              />
            </svg>
            <span>Database</span>
            <span>/</span>
            <span className="text-foreground">
              {selectedEntity?.name || "Select Entity"}
            </span>
            {selectedSource && (
              <>
                <span>/</span>
                <Badge variant="secondary">{selectedSource}</Badge>
              </>
            )}
          </div>

          {/* View Mode Toggle */}
          {currentSourceData &&
            !currentSourceData.loading &&
            !currentSourceData.error &&
            currentSourceData.data &&
            currentSourceData.data.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === "json" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("json")}
                >
                  JSON
                </Button>
                <Button
                  variant={viewMode === "unirender" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("unirender")}
                >
                  UniRender
                </Button>

                {/* UniRender Layout Selector */}
                {viewMode === "unirender" && (
                  <select
                    value={uniRenderLayout}
                    onChange={(e) =>
                      setUniRenderLayout(e.target.value as LayoutType)
                    }
                    className="h-8 bg-background border border-input rounded px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="table">Table</option>
                    <option value="card">Card</option>
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                    <option value="form">Form</option>
                    <option value="dashboard">Dashboard</option>
                  </select>
                )}
              </div>
            )}
        </Card>

        {/* Data Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filter Bar */}
          {currentSourceData &&
            !currentSourceData.loading &&
            !currentSourceData.error && (
              <Card className="rounded-none border-x-0 border-t-0 p-4">
                <div className="flex items-center space-x-4">
                  {/* Field Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Field:
                    </span>
                    <select
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      className="bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select Field</option>
                      {getAvailableFields().map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Operator Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Operator:
                    </span>
                    <select
                      value={searchOperator}
                      onChange={(e) => setSearchOperator(e.target.value as any)}
                      className="bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="contains">Contains</option>
                      <option value="equals">Equals</option>
                      <option value="startsWith">Starts With</option>
                      <option value="endsWith">Ends With</option>
                      <option value="gt">Greater Than</option>
                      <option value="gte">Greater Than or Equal</option>
                      <option value="lt">Less Than</option>
                      <option value="lte">Less Than or Equal</option>
                    </select>
                  </div>

                  {/* Search Value Input */}
                  <div className="flex-1 max-w-md">
                    <Input
                      type="text"
                      placeholder="Enter search value..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && executeSearch()}
                      className="text-sm"
                    />
                  </div>

                  {/* Search Button */}
                  <Button
                    onClick={executeSearch}
                    disabled={isSearching || !searchField}
                    size="sm"
                  >
                    {isSearching ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching...</span>
                      </div>
                    ) : (
                      <>
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        Search
                      </>
                    )}
                  </Button>

                  {/* Clear Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchField("");
                      setSearchValue("");
                      if (selectedEntity && selectedSource) {
                        loadSingleSourceData(
                          selectedEntity.name,
                          selectedSource
                        );
                      }
                    }}
                  >
                    Clear
                  </Button>

                  {/* Add Row Button */}
                  <Button
                    onClick={handleAddRow}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
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
                    Add Row
                  </Button>

                  {/* Results Count */}
                  <Badge variant="outline" className="text-sm">
                    {currentSourceData.data ? currentSourceData.data.length : 0}{" "}
                    records
                  </Badge>
                </div>
              </Card>
            )}

          {/* Data Display Area */}
          <div className="flex-1 overflow-auto">
            {currentSourceData?.loading ? (
              <div className="flex items-center justify-center h-64">
                <Card className="p-6">
                  <div className="text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <div className="text-muted-foreground">Loading data...</div>
                  </div>
                </Card>
              </div>
            ) : currentSourceData?.error ? (
              <div className="flex items-center justify-center h-64">
                <Card className="p-6">
                  <div className="text-center">
                    <div className="text-destructive mb-2">
                      Error loading data
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {currentSourceData.error}
                    </div>
                  </div>
                </Card>
              </div>
            ) : currentSourceData?.data && currentSourceData.data.length > 0 ? (
              <div className="p-4">
                {viewMode === "table" ? (
                  /* Table View */
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            {Object.keys(currentSourceData.data[0]).map(
                              (key) => (
                                <TableHead key={key}>{key}</TableHead>
                              )
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentSourceData.data.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-muted-foreground">
                                {index + 1}
                              </TableCell>
                              {Object.entries(item).map(([key, value]) => (
                                <TableCell key={key}>
                                  <div
                                    className="font-mono text-xs max-w-xs truncate"
                                    title={JSON.stringify(value)}
                                  >
                                    {typeof value === "string" ? (
                                      <span className="text-green-600 dark:text-green-400">
                                        "{value}"
                                      </span>
                                    ) : typeof value === "number" ? (
                                      <span className="text-blue-600 dark:text-blue-400">
                                        {value}
                                      </span>
                                    ) : typeof value === "boolean" ? (
                                      <span className="text-purple-600 dark:text-purple-400">
                                        {value.toString()}
                                      </span>
                                    ) : value === null ? (
                                      <span className="text-muted-foreground">
                                        null
                                      </span>
                                    ) : (
                                      <span className="text-orange-600 dark:text-orange-400">
                                        {JSON.stringify(value)}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Card className="rounded-none border-x-0 border-b-0 px-4 py-3">
                      <div className="text-sm text-muted-foreground">
                        Showing {currentSourceData.data.length} records
                      </div>
                    </Card>
                  </Card>
                ) : viewMode === "json" ? (
                  /* JSON View */
                  <div className="space-y-4">
                    {currentSourceData.data.map((item, index) => (
                      <Card key={index} className="p-4">
                        <CardHeader className="p-0 pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                ({index + 1})
                              </Badge>
                              <span className="text-muted-foreground text-sm font-mono">
                                id: {item.id || `Document_${index + 1}`}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {Object.keys(item).length} fields
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Card className="bg-muted p-3 overflow-auto">
                            <div className="font-mono text-sm">
                              {formatJsonValue(item)}
                            </div>
                          </Card>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* UniRender View */
                  <UniRender
                    entity={convertToUniRenderEntity(selectedEntity!)}
                    data={currentSourceData.data}
                    layout={uniRenderLayout}
                    config={getFieldConfig(selectedEntity!.name)}
                    loading={currentSourceData.loading}
                    error={currentSourceData.error}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <Card className="p-6">
                  <div className="text-center">
                    <div className="text-muted-foreground">
                      No data available
                    </div>
                    <div className="text-muted-foreground text-sm mt-1">
                      {selectedEntity && selectedSource
                        ? `No records found in ${selectedSource} for ${selectedEntity.name}`
                        : "Select an entity and source to view data"}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Row Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Row</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancelAdd}>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {selectedEntity?.schema?.properties &&
                  Object.entries(selectedEntity.schema.properties).map(
                    ([field, property]) => (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                          {field}
                          {selectedEntity.schema.required.includes(field) && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </label>

                        {property.type === "boolean" ? (
                          <select
                            value={newRowData[field] ? "true" : "false"}
                            onChange={(e) =>
                              handleInputChange(
                                field,
                                e.target.value === "true"
                              )
                            }
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="false">False</option>
                            <option value="true">True</option>
                          </select>
                        ) : property.type === "number" ? (
                          <Input
                            type="number"
                            value={newRowData[field] || ""}
                            onChange={(e) =>
                              handleInputChange(
                                field,
                                e.target.value ? Number(e.target.value) : 0
                              )
                            }
                            placeholder={`Enter ${field}...`}
                          />
                        ) : (
                          <Input
                            type="text"
                            value={newRowData[field] || ""}
                            onChange={(e) =>
                              handleInputChange(field, e.target.value)
                            }
                            placeholder={`Enter ${field}...`}
                          />
                        )}

                        {property.description && (
                          <p className="text-xs text-muted-foreground">
                            {property.description}
                          </p>
                        )}
                      </div>
                    )
                  )}
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-border">
                <Button variant="outline" onClick={handleCancelAdd}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRow}
                  disabled={addLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {addLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Row"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

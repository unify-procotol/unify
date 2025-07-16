import { useState, useEffect, useRef } from "react";
import { repo, URPC } from "@unilab/urpc";
import { UniRender, FieldConfig, UniRenderRef, LayoutType } from "@unilab/ukit";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
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
  const [collapsedEntities, setCollapsedEntities] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<'table' | 'custom'>('table');



  // Add Record modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // UniRender ref for refreshing data
  const uniRenderRef = useRef<UniRenderRef>(null);

  // Initialize URPC and load entities when connection status or baseUrl changes
  useEffect(() => {
    if (isConnected && baseUrl) {
      // Initialize URPC with the provided baseUrl
      URPC.init({
        baseUrl: baseUrl,
        timeout: 10000,
      });
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

      console.log("Loaded entities:", entitiesInfo);
      setEntities(entitiesInfo);

      if (entitiesInfo.length > 0) {
        console.log("Setting selected entity to:", entitiesInfo[0]);
        setSelectedEntity(entitiesInfo[0]);
        if (entitiesInfo[0].sources && entitiesInfo[0].sources.length > 0) {
          console.log("Setting selected source to:", entitiesInfo[0].sources[0]);
          setSelectedSource(entitiesInfo[0].sources[0]);
        }
        // Ensure the first entity is expanded by default
        setCollapsedEntities(new Set());
      } else {
        console.log("No entities found!");
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



  // Handle add record
  const handleAddRecord = () => {
    console.log("Add Record button clicked", {
      selectedEntity: selectedEntity?.name,
      selectedSource,
      showAddModal
    });
    setShowAddModal(true);
  };

  // Handle save new record
  const handleSaveRecord = async (data: any) => {
    if (!selectedEntity) return;

    try {
      await repo({
        entity: selectedEntity.name,
        source: selectedSource,
      }).create({
        data: data
      });

      // Close modal
      setShowAddModal(false);

      // Refresh UniRender data using ref
      if (uniRenderRef.current) {
        await uniRenderRef.current.refreshData();
        console.log("UniRender data refreshed after save");
      } else {
        // Fallback: reload data the old way
        await loadSingleSourceData(selectedEntity.name, selectedSource);
        console.log("Fallback: reloaded data using loadSingleSourceData");
      }
    } catch (err) {
      console.error("Failed to create record:", err);
      // You can add error handling here if needed
    }
  };



  // Function removed - new UniRender API uses entity name directly

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
          render: (value: any) => (
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
          render: (value: any) => (
            <span
              className={`px-2 py-1 rounded text-xs ${value >= 18
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
          render: (value: any) => (
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

  // Custom render function for card layout
  const renderCustomCardLayout = (data: any[], options: any) => {
    const getRandomColor = () => {
      const colors = [
        'bg-gradient-to-br from-blue-500 to-purple-600',
        'bg-gradient-to-br from-green-500 to-teal-600', 
        'bg-gradient-to-br from-orange-500 to-red-600',
        'bg-gradient-to-br from-pink-500 to-rose-600',
        'bg-gradient-to-br from-indigo-500 to-blue-600',
        'bg-gradient-to-br from-yellow-500 to-orange-600',
        'bg-gradient-to-br from-purple-500 to-pink-600',
        'bg-gradient-to-br from-cyan-500 to-blue-600',
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const getAuthorInitials = (name: string) => {
      if (!name) return "??";
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return "Unknown";
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    };

    const getReadingTime = (content: string) => {
      if (!content) return "1m read time";
      const words = content.split(' ').length;
      const minutes = Math.ceil(words / 200);
      return `${minutes}m read time`;
    };

    const getTags = (record: any) => {
      const tags = [];
      if (record.type) tags.push(`#${record.type}`);
      if (record.category) tags.push(`#${record.category}`);
      if (record.status) tags.push(`#${record.status}`);
      if (record.role) tags.push(`#${record.role}`);
      if (tags.length === 0) {
        tags.push('#general');
      }
      return tags.slice(0, 4); // Limit to 4 tags
    };

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((record, index) => {
          const cardColor = getRandomColor();
          const authorName = record.name || record.title || record.username || `Item ${index + 1}`;
          const content = record.content || record.description || record.details || "";
          const createdDate = record.createdAt || record.updatedAt || record.date || new Date().toISOString();
          const tags = getTags(record);
          
          return (
            <Card 
              key={record.id || index} 
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card Header with gradient background */}
              <div className={`${cardColor} p-4 text-white relative`}>
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => {/* Handle more options */}}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </Button>
                </div>
                
                {/* Author avatar */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-semibold">
                      {getAuthorInitials(authorName)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{selectedEntity?.name || "Entity"}</div>
                  </div>
                </div>

                                 {/* Title/Name */}
                 <h3 className="font-semibold text-lg mb-2 overflow-hidden" style={{ 
                   display: '-webkit-box',
                   WebkitLineClamp: 2,
                   WebkitBoxOrient: 'vertical' as any
                 }}>
                   {authorName}
                 </h3>

                {/* Meta info */}
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>{formatDate(createdDate)}</span>
                  <span>•</span>
                  <span>{getReadingTime(content)}</span>
                </div>
              </div>

              {/* Card Content */}
              <CardContent className="p-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {tags.map((tag, tagIndex) => (
                    <Badge 
                      key={tagIndex} 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                                 {/* Content preview */}
                 {content && (
                   <p className="text-sm text-muted-foreground mb-3 overflow-hidden" style={{ 
                     display: '-webkit-box',
                     WebkitLineClamp: 3,
                     WebkitBoxOrient: 'vertical' as any
                   }}>
                     {content}
                   </p>
                 )}

                {/* Record details */}
                <div className="space-y-2 text-xs">
                  {Object.entries(record).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="font-medium text-right max-w-32 truncate">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => options.onEdit(record, index)}
                      className="h-8 px-3 text-xs"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => options.onDelete(record, index)}
                      className="h-8 px-3 text-xs text-red-600 hover:text-red-700"
                      disabled={options.deletingIndex === index}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      {options.deletingIndex === index ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    #{options.startIndex + index + 1}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
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
                        className={`w-4 h-4 transform transition-transform ${isCollapsed ? "rotate-0" : "rotate-90"
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
          
          {/* Layout Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Layout:</span>
            <div className="flex items-center border rounded-md">
              <Button
                variant={currentLayout === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentLayout('table')}
                className="h-7 px-2 text-xs rounded-r-none"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M3 18h18M3 6h18" />
                </svg>
                Table
              </Button>
              <Button
                variant={currentLayout === 'custom' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentLayout('custom')}
                className="h-7 px-2 text-xs rounded-l-none"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Cards
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Data Display Area - Simplified to only use UniRender Table */}
          <div className="flex-1 overflow-auto">
            {selectedEntity ? (
              <div className="p-6">
                <UniRender
                  ref={uniRenderRef}
                  entity={selectedEntity.name}
                  source={selectedSource}
                  layout={currentLayout as any}
                  config={getFieldConfig(selectedEntity.name)}
                  generalConfig={{
                    showActions: true,
                    actions: {
                      delete: true,
                      edit: true,
                    }
                  }}
                  loading={currentSourceData?.loading}
                  error={currentSourceData?.error}
                  {...(currentLayout === 'custom' ? {
                    render: renderCustomCardLayout,
                    pagination: {
                      enabled: true,
                      pageSize: 8,
                    }
                  } : {})}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <Card className="p-6">
                  <div className="text-center">
                    <div className="text-muted-foreground">
                      Select an entity and source to view data
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Record Modal */}
      {(() => {
        console.log("Modal render condition check:", {
          showAddModal,
          selectedEntity: selectedEntity?.name,
          selectedSource,
          shouldRender: showAddModal && selectedEntity
        });
        return showAddModal && selectedEntity;
      })() && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Add New {selectedEntity?.name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
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

                <UniRender
                  entity={selectedEntity?.name || ""}
                  source={selectedSource}
                  layout="form"
                  query={{}}
                  config={getFieldConfig(selectedEntity?.name || "")}
                  onSave={handleSaveRecord}
                />
              </div>
            </Card>
          </div>
        )}

    </div>
  );
}

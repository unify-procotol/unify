import { useState, useEffect } from "react";
import { repo, UnifyClient } from "@unilab/unify-client";

// Entity schema type based on the API response
interface EntitySchema {
  name: string;
  schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  sources?: string[];
}

interface SourceData {
  entityName: string;
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
  const [entities, setEntities] = useState<EntitySchema[]>([]);
  const [sourceDataList, setSourceDataList] = useState<SourceData[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntitySchema | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [collapsedEntities, setCollapsedEntities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Query and search state
  const [searchField, setSearchField] = useState<string>("");
  const [searchOperator, setSearchOperator] = useState<'contains' | 'equals' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte'>('contains');
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
      const entitiesInfo = await repo<EntitySchema>("entity", "_global").findMany();
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
      entitiesInfo.forEach(entity => {
        if (entity.sources && entity.sources.length > 0) {
          entity.sources.forEach(source => {
            initialSourceData.push({
              entityName: entity.name,
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

  const loadAllSourceData = async (entitiesInfo: EntitySchema[]) => {
    // Create all loading promises
    const loadingPromises: Promise<void>[] = [];
    
    entitiesInfo.forEach(entity => {
      if (entity.sources && entity.sources.length > 0) {
        entity.sources.forEach(source => {
          const promise = loadSingleSourceData(entity.name, source);
          loadingPromises.push(promise);
        });
      }
    });
    
    // Wait for all data to load in parallel
    await Promise.allSettled(loadingPromises);
  };

  const loadSingleSourceData = async (entityName: string, source: string): Promise<void> => {
    try {
      // Convert entity name to repo name format (e.g., "UserEntity" -> "user")
      const repoName = entityName.toLowerCase().replace('entity', '');
      const data = await repo<any>(repoName, source).findMany();
      
      setSourceDataList(prev => prev.map(item => 
        item.entityName === entityName && item.source === source
          ? { ...item, data, loading: false }
          : item
      ));
    } catch (err) {
      setSourceDataList(prev => prev.map(item => 
        item.entityName === entityName && item.source === source
          ? { ...item, loading: false, error: err instanceof Error ? err.message : "Failed to load data" }
          : item
      ));
    }
  };

  const getCurrentSourceData = (): SourceData | undefined => {
    if (!selectedEntity || !selectedSource) return undefined;
    return sourceDataList.find(item => 
      item.entityName === selectedEntity.name && item.source === selectedSource
    );
  };

  const toggleEntityCollapse = (entityName: string) => {
    setCollapsedEntities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entityName)) {
        newSet.delete(entityName);
      } else {
        newSet.add(entityName);
      }
      return newSet;
    });
  };

  const isEntityCollapsed = (entityName: string) => collapsedEntities.has(entityName);

  // Execute search query on backend
  const executeSearch = async () => {
    if (!selectedEntity || !selectedSource) return;
    
    setIsSearching(true);
    try {
      const repoName = selectedEntity.name.toLowerCase().replace('entity', '');
      
      // Build query parameters based on search criteria using proper Unify syntax
      let findManyArgs: any = {};
      
      if (searchField && searchValue.trim()) {
        const whereCondition: any = {};
        
        // Build the query based on operator
        switch (searchOperator) {
          case 'contains':
            // For string contains, we might need to use a different approach
            // Since Unify might not support regex, we'll use equals for now
            whereCondition[searchField] = searchValue;
            break;
          case 'equals':
            whereCondition[searchField] = searchValue;
            break;
          case 'startsWith':
            // For startsWith, we'll also use equals for now
            whereCondition[searchField] = searchValue;
            break;
          case 'endsWith':
            // For endsWith, we'll also use equals for now
            whereCondition[searchField] = searchValue;
            break;
          case 'gt':
            whereCondition[searchField] = { $gt: isNaN(Number(searchValue)) ? searchValue : Number(searchValue) };
            break;
          case 'lt':
            whereCondition[searchField] = { $lt: isNaN(Number(searchValue)) ? searchValue : Number(searchValue) };
            break;
          case 'gte':
            whereCondition[searchField] = { $gte: isNaN(Number(searchValue)) ? searchValue : Number(searchValue) };
            break;
          case 'lte':
            whereCondition[searchField] = { $lte: isNaN(Number(searchValue)) ? searchValue : Number(searchValue) };
            break;
        }
        
        findManyArgs = {
          where: whereCondition
        };
      }
      
      console.log('findManyArgs:', findManyArgs);
      
      // Call the backend with proper Unify query syntax
      const searchResults = Object.keys(findManyArgs).length > 0 
        ? await repo<any>(repoName, selectedSource).findMany(findManyArgs)
        : await repo<any>(repoName, selectedSource).findMany();
      
      // Update the source data with search results
      setSourceDataList(prev => prev.map(item => 
        item.entityName === selectedEntity.name && item.source === selectedSource
          ? { ...item, data: searchResults, loading: false }
          : item
      ));
    } catch (err) {
      setSourceDataList(prev => prev.map(item => 
        item.entityName === selectedEntity.name && item.source === selectedSource
          ? { ...item, loading: false, error: err instanceof Error ? err.message : "Search failed" }
          : item
      ));
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
      Object.keys(selectedEntity.schema.properties).forEach(key => {
        const property = selectedEntity.schema.properties[key];
        if (property.type === 'string') {
          initialData[key] = '';
        } else if (property.type === 'number') {
          initialData[key] = 0;
        } else if (property.type === 'boolean') {
          initialData[key] = false;
        } else {
          initialData[key] = '';
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
      const repoName = selectedEntity.name.toLowerCase().replace('entity', '');
      
      // Create new record using Unify client
      await repo<any>(repoName, selectedSource).create({ data: newRowData });
      
      // Reload data to show the new record
      await loadSingleSourceData(selectedEntity.name, selectedSource);
      
      // Close form and reset
      setShowAddForm(false);
      setNewRowData({});
    } catch (err) {
      console.error('Failed to add row:', err);
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
    setNewRowData(prev => ({
      ...prev,
      [field]: value
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

  const formatJsonValue = (value: any, depth = 0): JSX.Element => {
    const indent = "  ".repeat(depth);
    
    if (value === null) return <span className="text-gray-500">null</span>;
    if (typeof value === "string") return <span className="text-green-400">"{value}"</span>;
    if (typeof value === "number") return <span className="text-blue-400">{value}</span>;
    if (typeof value === "boolean") return <span className="text-purple-400">{value.toString()}</span>;
    
    if (Array.isArray(value)) {
      return (
        <div>
          <span className="text-gray-300">[</span>
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {formatJsonValue(item, depth + 1)}
              {index < value.length - 1 && <span className="text-gray-300">,</span>}
            </div>
          ))}
          <span className="text-gray-300">]</span>
        </div>
      );
    }
    
    if (typeof value === "object") {
      const entries = Object.entries(value);
      return (
        <div>
          <span className="text-gray-300">{"{"}</span>
          {entries.map(([key, val], index) => (
            <div key={key} className="ml-4">
              <span className="text-orange-400">"{key}"</span>
              <span className="text-gray-300">: </span>
              {formatJsonValue(val, depth + 1)}
              {index < entries.length - 1 && <span className="text-gray-300">,</span>}
            </div>
          ))}
          <span className="text-gray-300">{"}"}</span>
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <div className="text-gray-300">Loading entities...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-lg font-medium mb-2">Error</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={loadEntities}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentSourceData = getCurrentSourceData();

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
        {/* Entities and Data Sources Tree */}
        <div className="flex-1 overflow-auto">
          <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4">
            <span className="text-sm font-medium text-gray-300">Database Explorer</span>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {entities.map(entity => {
                const isCollapsed = isEntityCollapsed(entity.name);
                const isSelected = selectedEntity?.name === entity.name;
                return (
                  <div key={entity.name} className="border border-gray-700 rounded-lg">
                    {/* Entity Header */}
                    <button
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
                      className={`w-full text-left px-3 py-2 ${isCollapsed ? 'rounded-lg' : 'rounded-t-lg'} transition-colors flex items-center justify-between ${
                        isSelected ? "bg-violet-600 text-white" : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                        <span className="font-medium">{entity.name}</span>
                      </div>
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                    
                    {/* Entity Details and Data Sources */}
                    {!isCollapsed && (
                      <div className="bg-gray-800 rounded-b-lg">
                        {/* Schema Info */}
                        <div className="px-3 py-2 border-b border-gray-700">
                          <div className="text-xs text-gray-400 mb-1">
                            Required: {entity.schema.required.join(', ')}
                          </div>
                        </div>
                        
                        {/* Data Sources */}
                        {entity.sources && entity.sources.length > 0 && (
                          <div className="px-3 py-2">
                            <div className="text-xs text-gray-400 mb-2 flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3 3 4-4"/>
                              </svg>
                              <span>Data Sources</span>
                            </div>
                            <div className="space-y-1 ml-4">
                              {entity.sources.map(source => {
                                const isSourceActive = selectedSource === source && selectedEntity?.name === entity.name;
                                const sourceStatus = sourceDataList.find(item => 
                                  item.entityName === entity.name && item.source === source
                                );
                                return (
                                  <button
                                    key={source}
                                    onClick={() => {
                                      setSelectedEntity(entity);
                                      setSelectedSource(source);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                                      isSourceActive ? "bg-orange-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                      </svg>
                                      <span className="capitalize">{source}</span>
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                      sourceStatus?.loading ? 'bg-yellow-400' :
                                      sourceStatus?.error ? 'bg-red-400' : 'bg-green-400'
                                    }`}></div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Data View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Entity Tabs */}
        <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {entities.map((entity) => (
              <button
                key={entity.name}
                onClick={() => {
                  setSelectedEntity(entity);
                  if (entity.sources && entity.sources.length > 0) {
                    setSelectedSource(entity.sources[0]);
                  }
                }}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  selectedEntity?.name === entity.name
                    ? "bg-orange-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{entity.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Breadcrumb and View Controls */}
        <div className="h-10 bg-gray-850 border-b border-gray-800 flex items-center justify-between px-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"/>
            </svg>
            <span className="text-gray-500">Database</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300">{selectedEntity?.name || "Select Entity"}</span>
            {selectedSource && (
              <>
                <span className="text-gray-600">/</span>
                <span className="text-orange-400 font-medium">{selectedSource}</span>
              </>
            )}
          </div>
          
          {/* View Mode Toggle */}
          {currentSourceData && !currentSourceData.loading && !currentSourceData.error && currentSourceData.data.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewMode === 'table' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewMode === 'json' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                JSON
              </button>
            </div>
          )}
        </div>

        {/* Data Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filter Bar */}
          {currentSourceData && !currentSourceData.loading && !currentSourceData.error && (
            <div className="bg-gray-900 border-b border-gray-800 p-4">
              <div className="flex items-center space-x-4">
                {/* Field Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Field:</span>
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select Field</option>
                    {getAvailableFields().map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>

                {/* Operator Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Operator:</span>
                  <select
                    value={searchOperator}
                    onChange={(e) => setSearchOperator(e.target.value as any)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                  <input
                    type="text"
                    placeholder="Enter search value..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && executeSearch()}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={executeSearch}
                  disabled={isSearching || !searchField}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {isSearching ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    "Search"
                  )}
                </button>

                {/* Clear Button */}
                <button
                  onClick={() => {
                    setSearchField("");
                    setSearchValue("");
                    if (selectedEntity && selectedSource) {
                      loadSingleSourceData(selectedEntity.name, selectedSource);
                    }
                  }}
                  className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  Clear
                </button>

                {/* Add Row Button */}
                <button
                  onClick={handleAddRow}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  <span>Add Row</span>
                </button>

                {/* Results Count */}
                <div className="text-sm text-gray-400">
                  {currentSourceData.data ? currentSourceData.data.length : 0} records
                </div>
              </div>
            </div>
          )}

          {/* Data Display Area */}
          <div className="flex-1 overflow-auto">
            {currentSourceData?.loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-gray-400">Loading data...</div>
              </div>
            </div>
          ) : currentSourceData?.error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-400 mb-2">Error loading data</div>
                <div className="text-gray-500 text-sm">{currentSourceData.error}</div>
              </div>
            </div>
          ) : currentSourceData?.data && currentSourceData.data.length > 0 ? (
            <div className="p-4">
              {viewMode === 'table' ? (
                /* Table View */
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                            #
                          </th>
                          {Object.keys(currentSourceData.data[0]).map(key => (
                            <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900 divide-y divide-gray-800">
                        {currentSourceData.data.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-800/50">
                            <td className="px-4 py-3 text-sm text-gray-400 border-b border-gray-800 font-mono">
                              {index + 1}
                            </td>
                            {Object.entries(item).map(([key, value]) => (
                              <td key={key} className="px-4 py-3 text-sm text-gray-300 border-b border-gray-800">
                                <div className="font-mono text-xs max-w-xs truncate" title={JSON.stringify(value)}>
                                  {typeof value === 'string' ? (
                                    <span className="text-green-400">"{value}"</span>
                                  ) : typeof value === 'number' ? (
                                    <span className="text-blue-400">{value}</span>
                                  ) : typeof value === 'boolean' ? (
                                    <span className="text-purple-400">{value.toString()}</span>
                                  ) : value === null ? (
                                    <span className="text-gray-500">null</span>
                                  ) : (
                                    <span className="text-orange-400">{JSON.stringify(value)}</span>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-3 bg-gray-800 border-t border-gray-700 text-sm text-gray-400">
                    Showing {currentSourceData.data.length} records
                  </div>
                </div>
              ) : (
                /* JSON View */
                <div className="space-y-4">
                  {currentSourceData.data.map((item, index) => (
                    <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">({index + 1})</span>
                          <span className="text-gray-500 text-sm font-mono">
                            id: {item.id || `Document_${index + 1}`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {Object.keys(item).length} fields
                        </div>
                      </div>
                      <div className="font-mono text-sm bg-gray-800 rounded p-3 overflow-auto">
                        {formatJsonValue(item)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-400">No data available</div>
                <div className="text-gray-500 text-sm mt-1">
                  {selectedEntity && selectedSource 
                    ? `No records found in ${selectedSource} for ${selectedEntity.name}`
                    : "Select an entity and source to view data"
                  }
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Add Row Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Add New Row</h2>
              <button
                onClick={handleCancelAdd}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {selectedEntity?.schema?.properties && Object.entries(selectedEntity.schema.properties).map(([field, property]) => (
                <div key={field} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    {field}
                    {selectedEntity.schema.required.includes(field) && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </label>
                  
                  {property.type === 'boolean' ? (
                    <select
                      value={newRowData[field] ? 'true' : 'false'}
                      onChange={(e) => handleInputChange(field, e.target.value === 'true')}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="false">False</option>
                      <option value="true">True</option>
                    </select>
                  ) : property.type === 'number' ? (
                    <input
                      type="number"
                      value={newRowData[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value ? Number(e.target.value) : 0)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={`Enter ${field}...`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={newRowData[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={`Enter ${field}...`}
                    />
                  )}
                  
                  {property.description && (
                    <p className="text-xs text-gray-500">{property.description}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-800">
              <button
                onClick={handleCancelAdd}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRow}
                disabled={addLoading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                {addLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Row"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
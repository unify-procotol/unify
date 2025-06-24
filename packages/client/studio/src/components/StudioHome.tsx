import { useState, useEffect } from "react";

// 为了避免循环依赖，我们直接在这里实现基本的client功能
class StudioClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  }

  async getEntities() {
    return this.request<{
      adapters: string[];
      entities: string[];
      combinations: { entity: string; adapter: string }[];
    }>("/entities");
  }

  async findMany(entity: string, adapter: string) {
    return this.request<any[]>(`/${entity}/list?source=${adapter}`);
  }
}

interface EntityData {
  entity: string;
  adapter: string;
  data: any[];
  loading: boolean;
  error: string | null;
}

export function StudioHome() {
  const [client] = useState(() => new StudioClient("http://localhost:3000"));
  const [entities, setEntities] = useState<{
    adapters: string[];
    entities: string[];
    combinations: { entity: string; adapter: string }[];
  } | null>(null);
  const [entityData, setEntityData] = useState<EntityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      setLoading(true);
      setError(null);
      const entitiesInfo = await client.getEntities();
      setEntities(entitiesInfo);
      
      // 为每个组合初始化数据状态
      const initialData: EntityData[] = entitiesInfo.combinations.map(combo => ({
        entity: combo.entity,
        adapter: combo.adapter,
        data: [],
        loading: false,
        error: null,
      }));
      setEntityData(initialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entities");
    } finally {
      setLoading(false);
    }
  };

  const loadEntityData = async (entity: string, adapter: string) => {
    setEntityData(prev => prev.map(item => 
      item.entity === entity && item.adapter === adapter
        ? { ...item, loading: true, error: null }
        : item
    ));

    try {
      const data = await client.findMany(entity, adapter);
      setEntityData(prev => prev.map(item => 
        item.entity === entity && item.adapter === adapter
          ? { ...item, data, loading: false }
          : item
      ));
    } catch (err) {
      setEntityData(prev => prev.map(item => 
        item.entity === entity && item.adapter === adapter
          ? { ...item, loading: false, error: err instanceof Error ? err.message : "Failed to load data" }
          : item
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading entities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-red-600">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={loadEntities}
            className="btn btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!entities) {
    return (
      <div className="card">
        <div className="text-gray-600">No entities found</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Entities</h3>
          <p className="text-3xl font-bold text-blue-600">{entities.entities.length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Adapters</h3>
          <p className="text-3xl font-bold text-green-600">{entities.adapters.length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Combinations</h3>
          <p className="text-3xl font-bold text-purple-600">{entities.combinations.length}</p>
        </div>
      </div>

      {/* Adapters List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Adapters</h3>
        <div className="flex flex-wrap gap-2">
          {entities.adapters.map(adapter => (
            <span
              key={adapter}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
            >
              {adapter}
            </span>
          ))}
        </div>
      </div>

      {/* Entity Data */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Entity Data</h2>
        
        {entities.combinations.map(combo => {
          const data = entityData.find(item => 
            item.entity === combo.entity && item.adapter === combo.adapter
          );

          return (
            <div key={`${combo.entity}-${combo.adapter}`} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {combo.entity} ({combo.adapter})
                </h3>
                <button
                  onClick={() => loadEntityData(combo.entity, combo.adapter)}
                  disabled={data?.loading}
                  className="btn btn-primary"
                >
                  {data?.loading ? "Loading..." : "Load Data"}
                </button>
              </div>

              {data?.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{data.error}</p>
                </div>
              )}

              {data?.data && data.data.length > 0 && (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        {Object.keys(data.data[0]).map(key => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex}>
                              {typeof value === "object" 
                                ? JSON.stringify(value, null, 2)
                                : String(value)
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {data?.data && data.data.length === 0 && !data.loading && (
                <div className="text-gray-500 text-center py-8">
                  No data found
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 
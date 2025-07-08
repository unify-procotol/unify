import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Database, 
  Hash, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  PieChart,
  FileText,
  Target
} from "lucide-react";

/**
 * Dashboard layout component for displaying data analytics and statistics
 */
export const DashboardLayout: React.FC<LayoutProps> = ({ 
  entity, 
  data, 
  config,
  generalConfig,
  onEdit,
  onDelete
}) => {
  const sortedFields = getSortedFields(entity, config);
  
  // Calculate comprehensive statistics
  const totalRecords = data.length;
  const stats = sortedFields.reduce((acc, field) => {
    const values = data.map(record => record[field.name]).filter(val => val !== null && val !== undefined);
    
    if (field.type === 'number') {
      const numValues = values.filter(val => typeof val === 'number');
      acc[field.name] = {
        type: 'number',
        label: config?.[field.name]?.label || field.name,
        total: numValues.reduce((sum, val) => sum + val, 0),
        average: numValues.length > 0 ? numValues.reduce((sum, val) => sum + val, 0) / numValues.length : 0,
        min: numValues.length > 0 ? Math.min(...numValues) : 0,
        max: numValues.length > 0 ? Math.max(...numValues) : 0,
        count: numValues.length
      };
    } else if (field.type === 'boolean') {
      const boolValues = values.filter(val => typeof val === 'boolean');
      const trueCount = boolValues.filter(val => val === true).length;
      acc[field.name] = {
        type: 'boolean',
        label: config?.[field.name]?.label || field.name,
        trueCount,
        falseCount: boolValues.length - trueCount,
        percentage: boolValues.length > 0 ? Math.round((trueCount / boolValues.length) * 100) : 0
      };
    } else {
      // String or other types - show unique values distribution
      const uniqueValues = Array.from(new Set(values));
      const valueCounts = values.reduce((counts: Record<string, number>, val) => {
        const key = String(val);
        counts[key] = (counts[key] || 0) + 1;
        return counts;
      }, {});
      
      acc[field.name] = {
        type: 'string',
        label: config?.[field.name]?.label || field.name,
        uniqueCount: uniqueValues.length,
        totalCount: values.length,
        diversity: uniqueValues.length / Math.max(values.length, 1),
        topValues: Object.entries(valueCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
      };
    }
    
    return acc;
  }, {} as Record<string, any>);

  const dataCompleteness = totalRecords > 0 ? 
    Math.round((Object.values(stats).reduce((sum: number, stat: any) => sum + stat.totalCount || stat.count || 0, 0) / (sortedFields.length * totalRecords)) * 100) : 0;

  /**
   * Render overview statistics cards
   */
  const renderOverviewCards = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-shadow duration-200 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Database className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {totalRecords > 0 ? 'Records available' : 'No records found'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-shadow duration-200 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Hash className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Fields</p>
              <p className="text-2xl font-bold">{sortedFields.length}</p>
              <p className="text-xs text-muted-foreground">
                Defined schema fields
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-shadow duration-200 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
              <p className="text-lg font-bold truncate">{entity.name}</p>
              <p className="text-xs text-muted-foreground">
                Data entity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-shadow duration-200 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Completeness</p>
              <p className="text-2xl font-bold">{dataCompleteness}%</p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${dataCompleteness}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /**
   * Render field statistics
   */
  const renderFieldStatistics = () => (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {Object.entries(stats).map(([fieldName, stat]) => (
        <Card key={fieldName} className="transition-shadow duration-200 hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {stat.type === 'number' && <BarChart3 className="h-5 w-5 text-muted-foreground" />}
                {stat.type === 'boolean' && <Target className="h-5 w-5 text-muted-foreground" />}
                {stat.type === 'string' && <PieChart className="h-5 w-5 text-muted-foreground" />}
                <span className="truncate">{stat.label}</span>
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {stat.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {stat.type === 'number' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-muted rounded-lg border">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg border">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.average.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Average</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 px-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Min</span>
                    <span className="font-bold">{stat.min.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Max</span>
                    <span className="font-bold">{stat.max.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Count</span>
                    <Badge variant="secondary">{stat.count}</Badge>
                  </div>
                </div>
              </div>
            )}
            
            {stat.type === 'boolean' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-muted rounded-lg border">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      <div className="text-2xl font-bold text-foreground">
                        {stat.trueCount}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">True</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg border">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                      <div className="text-2xl font-bold text-foreground">
                        {stat.falseCount}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">False</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold text-foreground">
                      {stat.percentage}%
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">true values</span>
                  </div>
                </div>
              </div>
            )}
            
            {stat.type === 'string' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-muted rounded-lg border">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.uniqueCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Unique</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg border">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.totalCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 px-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Diversity</span>
                    <Badge variant="secondary">{(stat.diversity * 100).toFixed(1)}%</Badge>
                  </div>
                  
                  {stat.topValues.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Top Values
                      </div>
                      <div className="space-y-2">
                        {stat.topValues.map(([value, count]: [string, number], index: number) => (
                          <div key={value} className="flex justify-between items-center py-1 px-2 bg-muted rounded">
                            <span className="text-sm text-foreground truncate flex-1" title={value}>
                              <span className="font-medium text-muted-foreground mr-2">
                                {index + 1}.
                              </span>
                              {value}
                            </span>
                            <Badge variant="outline" className="text-xs ml-2">
                              {count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="border-b pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{entity.name} Dashboard</h1>
            <p className="text-muted-foreground">
              Analytics and insights for your {entity.name.toLowerCase()} data
            </p>
          </div>
        </div>
      </div>

      {/* Overview cards */}
      {renderOverviewCards()}

      {/* Field statistics */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Field Statistics</h2>
        {renderFieldStatistics()}
      </div>

      {/* Empty state */}
      {totalRecords === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No data available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add some {entity.name.toLowerCase()} records to see analytics and insights.
          </p>
        </div>
      )}
    </div>
  );
}; 
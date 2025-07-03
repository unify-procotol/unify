import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

/**
 * Dashboard layout component for displaying data analytics and statistics
 */
export const DashboardLayout: React.FC<LayoutProps> = ({ 
  entity, 
  data, 
  config
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

  /**
   * Render overview statistics cards
   */
  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecords.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fields</p>
              <p className="text-2xl font-bold text-gray-900">{sortedFields.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entity</p>
              <p className="text-lg font-bold text-gray-900 truncate">{entity.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Data Completeness</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalRecords > 0 ? Math.round((Object.values(stats).reduce((sum: number, stat: any) => sum + stat.totalCount || stat.count || 0, 0) / (sortedFields.length * totalRecords)) * 100) : 0}%
              </p>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Object.entries(stats).map(([fieldName, stat]) => (
        <Card key={fieldName} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{stat.label}</span>
              <Badge variant="outline" className="text-xs">
                {stat.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stat.type === 'number' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stat.total.toLocaleString()}</div>
                    <div className="text-xs text-blue-500">Total</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stat.average.toFixed(2)}</div>
                    <div className="text-xs text-green-500">Average</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Min</span>
                    <span className="font-semibold text-gray-900">{stat.min.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Max</span>
                    <span className="font-semibold text-gray-900">{stat.max.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-sm text-gray-600">Count</span>
                  <span className="font-semibold text-purple-600">{stat.count}</span>
                </div>
              </div>
            )}
            
            {stat.type === 'boolean' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stat.trueCount}</div>
                    <div className="text-xs text-green-500">True</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stat.falseCount}</div>
                    <div className="text-xs text-red-500">False</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold text-blue-600">{stat.percentage}%</span>
                  <span className="text-sm text-gray-500 ml-1">true values</span>
                </div>
              </div>
            )}
            
            {stat.type === 'string' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-cyan-50 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-600">{stat.uniqueCount}</div>
                    <div className="text-xs text-cyan-500">Unique</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stat.totalCount}</div>
                    <div className="text-xs text-orange-500">Total</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Diversity</span>
                  <span className="font-semibold text-purple-600">{(stat.diversity * 100).toFixed(1)}%</span>
                </div>
                
                {stat.topValues.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-500 mb-2">Top Values:</div>
                    <div className="space-y-1">
                      {stat.topValues.map(([value, count]: [string, number], index: number) => (
                        <div key={value} className="flex justify-between items-center text-xs">
                          <span className="text-gray-700 truncate max-w-24" title={value}>
                            {index + 1}. {value}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{entity.name} Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Analytics and insights for your {entity.name.toLowerCase()} data
        </p>
      </div>

      {/* Overview cards */}
      {renderOverviewCards()}

      {/* Field statistics */}
      {renderFieldStatistics()}
    </div>
  );
}; 
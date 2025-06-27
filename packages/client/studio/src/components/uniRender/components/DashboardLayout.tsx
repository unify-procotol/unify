import React from "react";
import { LayoutProps } from "../types";
import { getSortedFields } from "../utils";

export const DashboardLayout: React.FC<LayoutProps> = ({ 
  entity, 
  data, 
  config
}) => {
  const sortedFields = getSortedFields(entity, config);
  
  // Calculate statistics
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
      // String or other types - show unique values
      const uniqueValues = [...new Set(values)];
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
        topValues: Object.entries(valueCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
      };
    }
    
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Records</p>
              <p className="text-2xl font-semibold text-white">{totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Fields</p>
              <p className="text-2xl font-semibold text-white">{sortedFields.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Entity</p>
              <p className="text-2xl font-semibold text-white">{entity.name}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Avg Fields/Record</p>
              <p className="text-2xl font-semibold text-white">
                {totalRecords > 0 ? Math.round((sortedFields.length * totalRecords) / totalRecords) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Field Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(stats).map(([fieldName, stat]) => (
          <div key={fieldName} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{stat.label}</h3>
            
            {stat.type === 'number' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="text-blue-400 font-mono">{stat.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Average</span>
                  <span className="text-green-400 font-mono">{stat.average.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Count</span>
                  <span className="text-purple-400 font-mono">{stat.count}</span>
                </div>
              </div>
            )}
            
            {stat.type === 'boolean' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">True</span>
                  <span className="text-green-400 font-mono">{stat.trueCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">False</span>
                  <span className="text-red-400 font-mono">{stat.falseCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">True %</span>
                  <span className="text-blue-400 font-mono">{stat.percentage}%</span>
                </div>
              </div>
            )}
            
            {stat.type === 'string' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Unique Values</span>
                  <span className="text-cyan-400 font-mono">{stat.uniqueCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Values</span>
                  <span className="text-orange-400 font-mono">{stat.totalCount}</span>
                </div>
                {stat.topValues.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">Top Values:</div>
                    <div className="space-y-1">
                      {stat.topValues.map(([value, count]: [string, number]) => (
                        <div key={value} className="flex justify-between items-center text-xs">
                          <span className="text-gray-400 truncate max-w-32" title={value}>
                            {value}
                          </span>
                          <span className="text-gray-300 font-mono">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 
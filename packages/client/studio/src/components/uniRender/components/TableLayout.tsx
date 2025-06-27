import React, { useState } from "react";
import { LayoutProps } from "../types";
import { getSortedFields, renderFieldValue } from "../utils";
import { EditModal } from "./EditModal";

export const TableLayout: React.FC<LayoutProps> = ({ 
  entity, 
  data, 
  config, 
  generalConfig,
  onEdit,
  onDelete
}) => {
  const sortedFields = getSortedFields(entity, config);
  const [editingRecord, setEditingRecord] = useState<{ record: any; index: number } | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  
  const showActions = generalConfig?.showActions && (onEdit || onDelete || generalConfig?.actions?.custom);

  const handleEdit = (record: any, index: number) => {
    setEditingRecord({ record, index });
  };

  const handleDelete = async (record: any, index: number) => {
    if (!onDelete) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;
    
    setDeletingIndex(index);
    try {
      await onDelete(record, index);
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleSaveEdit = async (updatedRecord: any, index: number) => {
    if (!onEdit) return;
    await onEdit(updatedRecord, index);
    setEditingRecord(null);
  };

  return (
    <>
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                  #
                </th>
                {sortedFields.map(field => (
                  <th 
                    key={field.name} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700"
                    style={{ width: config?.[field.name]?.width }}
                  >
                    {config?.[field.name]?.label || field.name}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </th>
                ))}
                {showActions && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {data.map((record, index) => (
                <tr key={index} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-gray-400 border-b border-gray-800 font-mono">
                    {index + 1}
                  </td>
                  {sortedFields.map(field => (
                    <td 
                      key={field.name} 
                      className={`px-4 py-3 text-sm text-gray-300 border-b border-gray-800 ${
                        config?.[field.name]?.align === 'center' ? 'text-center' :
                        config?.[field.name]?.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div className="font-mono text-xs max-w-xs truncate" title={JSON.stringify(record[field.name])}>
                        {renderFieldValue(record[field.name], field, record, index, config?.[field.name])}
                      </div>
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-4 py-3 text-sm text-gray-300 border-b border-gray-800">
                      <div className="flex items-center space-x-2">
                        {(generalConfig?.actions?.edit !== false && onEdit) && (
                          <button
                            onClick={() => handleEdit(record, index)}
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                        )}
                        {(generalConfig?.actions?.delete !== false && onDelete) && (
                          <button
                            onClick={() => handleDelete(record, index)}
                            disabled={deletingIndex === index}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingIndex === index ? (
                              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            )}
                          </button>
                        )}
                        {generalConfig?.actions?.custom?.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(record, index)}
                            className={action.className || "p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded transition-colors"}
                            title={action.label}
                          >
                            {action.icon || (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-800 border-t border-gray-700 text-sm text-gray-400">
          Showing {data.length} records
        </div>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <EditModal
          isOpen={true}
          onClose={() => setEditingRecord(null)}
          record={editingRecord.record}
          entity={entity}
          config={config}
          onSave={handleSaveEdit}
          index={editingRecord.index}
        />
      )}
    </>
  );
}; 
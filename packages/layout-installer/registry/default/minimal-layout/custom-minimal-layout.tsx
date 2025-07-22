import React from 'react';

// Minimal layout renderer
export const MinimalLayout = (data: any[], options: any) => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="space-y-6">
        {data.map((record, index) => {
          const title = record.name || record.title || `Item ${index + 1}`;
          const content = record.content || record.description || "";
          const author = record.email || record.author || 'Author';
          
          return (
            <div 
              key={record.id + Math.random() || index} 
              className="py-4 border-b border-gray-100 last:border-b-0"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {title}
              </h3>
              
              {content && (
                <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                  {content}
                </p>
              )}
              
              <div className="text-xs text-gray-500">
                By {author}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

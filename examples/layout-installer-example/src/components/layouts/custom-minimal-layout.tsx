import React from 'react';

// Minimal layout renderer
export const renderMinimalLayout = (data: any[], options: any) => {
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
              className="pb-6 border-b border-border last:border-b-0"
            >
              <h2 className="text-xl font-bold text-foreground mb-3 hover:text-primary cursor-pointer line-clamp-2 transition-colors">
                {title}
              </h2>
              
              {content && (
                <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                  {content}
                </p>
              )}
              
              <div className="text-sm text-muted-foreground/70">
                {author}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 
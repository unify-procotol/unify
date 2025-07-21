import React from 'react';

// Common blog-style layout renderer
export const renderMagazineLayout = (data: any[], options: any) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    if (!content) return "5 min read";
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {data.map((record, index) => {
        const title = record.name || record.title || `Article ${index + 1}`;
        const content = record.content || record.description || record.details || "";
        const createdDate = record.createdAt || record.updatedAt || record.date || new Date().toISOString();
        const category = record.category || record.type || 'General';
        const author = record.email || record.author || 'Author';
        
        return (
          <article 
            key={record.id + Math.random() || index} 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Thumbnail */}
              <div className="md:w-48 md:h-32 h-48 bg-gray-100 flex-shrink-0">
                {record.imageUrl ? (
                  <img 
                    src={record.imageUrl} 
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center hidden">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <div className="text-xs text-gray-500">No image</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-5">
                {/* Category */}
                <div className="flex items-center mb-1">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-1 leading-tight hover:text-blue-600 cursor-pointer">
                  {title}
                </h2>

                {/* Content Preview */}
                {content && (
                  <p className="text-gray-600 mb-3 leading-relaxed line-clamp-2">
                    {content.length > 150 ? content.substring(0, 150) + "..." : content}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>By {author}</span>
                    <span>•</span>
                    <span>{formatDate(createdDate)}</span>
                    <span>•</span>
                    <span>{getReadingTime(content)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button className="hover:text-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </button>
                    <button className="hover:text-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}; 
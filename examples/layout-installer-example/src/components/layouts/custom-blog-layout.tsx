import React from 'react';

// Modern blog layout renderer
export const renderBlogLayout = (data: any[], options: any) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    if (!content) return "5 min read";
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const getAuthorInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-6">
        {data.map((record, index) => {
          const title = record.name || record.title || `Article ${index + 1}`;
          const content = record.content || record.description || record.details || "";
          const createdDate = record.createdAt || record.updatedAt || record.date || new Date().toISOString();
          const category = record.category || record.type || 'General';
          const author = record.email || record.author || 'Author';
          const role = record.role || 'Writer';
          
          return (
            <article 
              key={record.id + Math.random() || index} 
              className="group bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 rounded-lg p-6 shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
                {/* Content Section */}
                <div className="flex-1">
                  {/* Category & Reading Time */}
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                      {category}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {getReadingTime(content)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                    {title}
                  </h2>

                  {/* Content Preview */}
                  {content && (
                    <p className="text-gray-600 mb-4 leading-relaxed text-base">
                      {content.length > 200 ? content.substring(0, 200) + "..." : content}
                    </p>
                  )}

                  {/* Author & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {getAuthorInitials(author)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{author}</div>
                        <div className="text-xs text-gray-500">{role}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {formatDate(createdDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="lg:w-48 lg:h-32 w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mt-4 lg:mt-0">
                  {record.imageUrl ? (
                    <img 
                      src={record.imageUrl} 
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <span>24</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <span>8</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                    <span>Save</span>
                  </button>
                </div>
                
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                  Read more →
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}; 
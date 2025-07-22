import React from 'react';

// Common blog-style layout renderer
export const MagazineLayout = (data: any[], options: any) => {
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

  const getAuthorInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {data.map((record, index) => {
          const title = record.name || record.title || `Article ${index + 1}`;
          const content = record.content || record.description || record.details || "";
          const createdDate = record.createdAt || record.updatedAt || record.date || new Date().toISOString();
          const category = record.category || record.type || 'General';
          const author = record.email || record.author || 'Author';
          
          // Featured article (first one, spans more columns)
          if (index === 0) {
            return (
              <article 
                key={record.id + Math.random() || index} 
                className="lg:col-span-8 group cursor-pointer"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  {/* Featured Image */}
                  <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {record.imageUrl ? (
                      <img 
                        src={record.imageUrl} 
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl font-bold text-gray-300 mb-2">M</div>
                          <div className="text-sm text-gray-400">Magazine Featured</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                        {category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                      {title}
                    </h1>
                    
                    {content && (
                      <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        {content.substring(0, 200)}...
                      </p>
                    )}
                    
                    {/* Author & Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {getAuthorInitials(author)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{author}</div>
                          <div className="text-sm text-gray-500">{formatDate(createdDate)}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {getReadingTime(content)}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          }
          
          // Secondary articles (smaller cards)
          return (
            <article 
              key={record.id + Math.random() || index} 
              className="lg:col-span-4 group cursor-pointer"
            >
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200">
                {/* Image */}
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  {record.imageUrl ? (
                    <img 
                      src={record.imageUrl} 
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-2xl font-bold text-gray-300">
                        {title.charAt(0)}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(createdDate)}
                    </span>
                  </div>
                  
                  <h2 className="font-semibold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {title}
                  </h2>
                  
                  {content && (
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {content.substring(0, 100)}...
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{author}</span>
                    <span>{getReadingTime(content)}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
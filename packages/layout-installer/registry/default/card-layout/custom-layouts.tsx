import React from 'react';

// Custom card layout renderer inspired by daily.dev
export const CardLayout = (data: any[], options: any) => {
  const getAuthorInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    if (!content) return "1m read time";
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes}m read time`;
  };

  const getTags = (record: any) => {
    const tags: string[] = [];
    if (record.type) tags.push(record.type);
    if (record.category) tags.push(record.category);
    if (record.status) tags.push(record.status);
    if (record.role) tags.push(record.role);
    if (tags.length === 0) {
      tags.push('general');
    }
    return tags.slice(0, 3); // Limit to 3 tags like daily.dev
  };

  const getRandomLikes = () => Math.floor(Math.random() * 500) + 10;
  const getRandomComments = () => Math.floor(Math.random() * 50) + 1;

  return (
    <div className="grid gap-4 grid-cols-2">
      {data.map((record, index) => {
        const authorName = record.name || record.title || record.username || `Item ${index + 1}`;
        const content = record.content || record.description || record.details || "";
        const createdDate = record.createdAt || record.updatedAt || record.date || new Date().toISOString();
        const tags = getTags(record);
        const likes = getRandomLikes();
        const comments = getRandomComments();
        
        return (
          <div 
            key={record.id + Math.random() || index} 
            className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            {/* Cover Image */}
            <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden rounded-t-lg">
              {record.imageUrl ? (
                <img 
                  src={record.imageUrl} 
                  alt={authorName}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center hidden">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="text-xs text-gray-500">Image placeholder</div>
                </div>
              </div>
              
              {/* Tags overlay */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                {tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex} 
                    className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* More options */}
              <div className="absolute top-3 right-3">
                <button className="w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4">
              {/* Author Info */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {getAuthorInitials(authorName)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {record.email || 'Author'}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <span>{formatDate(createdDate)}</span>
                    <span>•</span>
                    <span>{getReadingTime(content)}</span>
                  </div>
                </div>
              </div>

              {/* Article Title */}
              <h3 className="font-semibold text-lg text-gray-900 mb-2 leading-tight" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as any,
                overflow: 'hidden'
              }}>
                {authorName}
              </h3>

              {/* Content Preview */}
              {content && (
                <p className="text-sm text-gray-600 mb-4 leading-relaxed" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as any,
                  overflow: 'hidden'
                }}>
                  {content}
                </p>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  {/* Upvote */}
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                    </svg>
                    <span className="text-sm font-medium">{likes}</span>
                  </button>

                  {/* Comments */}
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <span className="text-sm font-medium">{comments}</span>
                  </button>

                  {/* Share */}
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                    </svg>
                  </button>
                </div>

                {/* Bookmark */}
                <button className="text-gray-500 hover:text-yellow-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
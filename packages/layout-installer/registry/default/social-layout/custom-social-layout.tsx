import React from 'react';

// Modern social media layout renderer
export const SocialLayout = (data: any[], options: any) => {
  const getAuthorInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "now";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRandomLikes = () => Math.floor(Math.random() * 1000) + 50;
  const getRandomComments = () => Math.floor(Math.random() * 100) + 5;
  const getRandomShares = () => Math.floor(Math.random() * 50) + 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {data.map((record, index) => {
        const title = record.name || record.title || `Post ${index + 1}`;
        const content = record.content || record.description || record.details || "";
        const createdDate = record.createdAt || record.updatedAt || record.date || new Date().toISOString();
        const author = record.email || record.author || 'User';
        const category = record.category || record.type || 'General';
        const likes = getRandomLikes();
        const comments = getRandomComments();
        const shares = getRandomShares();
        
        return (
          <div 
            key={record.id + Math.random() || index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {getAuthorInitials(author)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{author}</div>
                    <div className="text-xs text-gray-500">{formatTimeAgo(createdDate)}</div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              {content && (
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {content}
                </p>
              )}
              
              {/* Category tag */}
              <div className="flex items-center">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  #{category.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Image placeholder */}
            {record.imageUrl ? (
              <div className="aspect-[16/9] relative">
                <img 
                  src={record.imageUrl} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[16/9] bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <div className="text-sm text-gray-400">No image</div>
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-4">
                  <span>{likes.toLocaleString()} likes</span>
                  <span>{comments} comments</span>
                  <span>{shares} shares</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Like</span>
                </button>

                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Comment</span>
                </button>

                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Share</span>
                </button>

                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Save</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

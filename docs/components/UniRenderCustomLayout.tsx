"use client";

import { UniRender } from "@unilab/ukit";
import { repo, URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { Logging } from "@unilab/urpc-core/middleware";
import { useState, useEffect } from "react";
import { PostEntity } from "./entities/post";

const MyPlugin: Plugin = {
  entities: [PostEntity],
};

// Custom card layout renderer inspired by daily.dev
export const renderCustomCardLayout = (data: any[], options: any) => {
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
    const tags = [];
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
            key={record.id || index} 
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

// Global variable to track initialization status for current session
let isSessionInitialized = false;

interface UniRenderCustomLayoutProps {
  type: 'basic' | 'magazine' | 'social' | 'blog' | 'minimal';
}

export function UniRenderCustomLayout({ type }: UniRenderCustomLayoutProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeURPC = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Dynamic import MockAdapter to avoid SSR issues
        const { MockAdapter } = await import("@unilab/urpc-adapters");
        
        // Initialize URPC only on client side
        URPC.init({
          plugins: [MyPlugin],
          middlewares: [Logging()],
          entityConfigs: {
            post: {
              defaultSource: "mock",
            },
            schema: {
              defaultSource: "_global",
            },
          },
          globalAdapters: [MockAdapter],
        });

        // Check if data has been initialized in current session using global variable
        if (!isSessionInitialized) {
          console.log("Creating initial mock data...");
          
          // Available images for random display
          const images = [
            "https://media.daily.dev/image/upload/s--AC8ihwmO--/f_auto/v1746082658/posts/xjMewZTM2",
            "https://i0.wp.com/devjournal.info/wp-content/uploads/2025/05/minio-s3-image.png?fit=600%2C452&ssl=1",
            "https://flo-bit.dev/ui-kit/opengraph.png"
          ];

          // Create some mock data for different types
          const mockData = [
            {
              id: "1",
              name: "React Performance Optimization",
              email: "john.doe@example.com",
              role: "Frontend",
              type: "article",
              category: "development",
              status: "published",
              isActive: true,
              content: "Learn advanced techniques for optimizing React applications performance including memoization, virtualization, and code splitting strategies.",
              createdAt: new Date().toISOString(),
              imageUrl: images[Math.floor(Math.random() * images.length)],
            },
            {
              id: "2",
              name: "Understanding TypeScript Generics",
              email: "jane.smith@example.com",
              role: "Backend",
              type: "tutorial",
              category: "typescript",
              status: "draft",
              isActive: true,
              content: "A comprehensive guide to TypeScript generics, covering basic concepts to advanced patterns and real-world applications.",
              createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              imageUrl: images[Math.floor(Math.random() * images.length)],
            },
            {
              id: "3",
              name: "Building Scalable APIs",
              email: "bob.johnson@example.com",
              role: "DevOps",
              type: "guide",
              category: "backend",
              status: "published",
              isActive: false,
              content: "Best practices for designing and implementing scalable REST APIs with proper authentication, caching, and monitoring.",
              createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              imageUrl: images[Math.floor(Math.random() * images.length)],
            },
            {
              id: "4",
              name: "CSS Grid Layout Mastery",
              email: "alice.davis@example.com",
              role: "Designer",
              type: "workshop",
              category: "design",
              status: "published",
              isActive: true,
              content: "Master CSS Grid layout with practical examples and advanced techniques for creating responsive layouts.",
              createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
              imageUrl: images[Math.floor(Math.random() * images.length)],
            },
            {
              id: "5",
              name: "Database Optimization Strategies",
              email: "charlie.brown@example.com",
              role: "Database",
              type: "article",
              category: "database",
              status: "published",
              isActive: true,
              content: "Proven strategies for optimizing database performance including indexing, query optimization, and schema design.",
              createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
              imageUrl: images[Math.floor(Math.random() * images.length)],
            },
            {
              id: "6",
              name: "Modern JavaScript Features",
              email: "diana.wilson@example.com",
              role: "Frontend",
              type: "reference",
              category: "javascript",
              status: "published",
              isActive: true,
              content: "Explore the latest JavaScript features including async/await, destructuring, modules, and more.",
              createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
              imageUrl: images[Math.floor(Math.random() * images.length)],
            }
          ];

          for (const item of mockData) {
            await repo({
              entity: "post",
            }).create({
              data: item,
            });
          }
          
          // Mark current session as initialized
          isSessionInitialized = true;
          console.log("Mock data created successfully");
        } else {
          console.log("Mock data already initialized in this session, skipping creation");
        }

        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize URPC');
      } finally {
        setLoading(false);
      }
    };

    if (!isInitialized) {
      initializeURPC();
    }
  }, [isInitialized]);

  // Show corresponding states if still initializing or encountering errors
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Initializing URPC...</div>
          <div className="text-gray-400 text-sm mt-1">
            Setting up data adapters and mock data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-red-400">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="text-red-600 text-lg font-semibold mb-2">
            Initialization Failed
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsInitialized(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Only render UniRender component after URPC is fully initialized
  if (!isInitialized) {
    return null;
  }

  const handleEdit = async (updatedRecord: any, index: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Updated record:', updatedRecord);
  };

  const handleDelete = async (record: any, index: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Deleted record:', record);
  };

  const examples = {
    basic: {
      entity: "post",
      source: "mock",
      layout: 'custom' as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: 'Title' },
        content: { label: 'Content' },
        role: { label: 'Role' },
        type: { label: 'Type' },
        category: { label: 'Category' },
        status: { label: 'Status' },
        isActive: { label: 'Active' },
        createdAt: { label: 'Created' }
      },
      pagination: {
        enabled: true,
        pageSize: 6,
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    },
    magazine: {
      entity: "post",
      source: "mock",
      layout: 'custom' as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: 'Article Title' },
        content: { label: 'Content' },
        role: { label: 'Department' },
        type: { label: 'Type' },
        category: { label: 'Category' },
        status: { label: 'Status' },
      },
      pagination: {
        enabled: true,
        pageSize: 8,
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    },
    social: {
      entity: "post",
      source: "mock",
      layout: 'custom' as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: 'Post Title' },
        content: { label: 'Content' },
        role: { label: 'User Role' },
        type: { label: 'Post Type' },
        category: { label: 'Category' },
        status: { label: 'Status' },
      },
      pagination: {
        enabled: true,
        pageSize: 9,
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    },
    blog: {
      entity: "post",
      source: "mock",
      layout: 'custom' as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: 'Blog Title' },
        content: { label: 'Content' },
        role: { label: 'Author Role' },
        type: { label: 'Post Type' },
        category: { label: 'Category' },
        status: { label: 'Status' },
      },
      pagination: {
        enabled: true,
        pageSize: 4,
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    },
    minimal: {
      entity: "post",
      source: "mock",
      layout: 'custom' as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: 'Title' },
        content: { label: 'Description' },
        role: { label: 'Role' },
        status: { label: 'Status' },
      },
      pagination: {
        enabled: true,
        pageSize: 12,
      },
      onEdit: handleEdit,
      onDelete: handleDelete
    }
  };

  const baseProps = examples[type];
  
  // Dynamically create final props to avoid type errors
  const finalProps: any = { ...baseProps };
  
  // For normal examples, URPC is fully initialized, no loading state needed
  finalProps.loading = false;
  finalProps.error = null;
  
  // Ensure required properties exist
  finalProps.entity = finalProps.entity || "post";
  finalProps.layout = finalProps.layout || "custom";
  
  // Add debug information
  if (process.env.NODE_ENV === 'development') {
    console.log('UniRender Custom Layout props:', finalProps);
  }
  
  return <UniRender {...finalProps} />;
}

import React, { useState } from 'react';
import { 
  renderCustomCardLayout,
  renderBlogLayout,
  renderSocialLayout,
  renderMagazineLayout,
  renderMinimalLayout,
  LoadingState,
  ErrorState
} from './components/layouts';

// Mock data
const mockData = [
  {
    id: 1,
    name: "Building Modern React Applications",
    content: "Learn to use the latest React Hooks and component patterns to build maintainable applications. This article will dive deep into functional components, custom Hooks, and state management best practices.",
    email: "developer@example.com",
    category: "Technology",
    type: "tutorial",
    createdAt: "2024-01-20T10:30:00Z",
    imageUrl: "https://via.placeholder.com/400x300?text=React+Tutorial"
  },
  {
    id: 2,
    name: "Advanced TypeScript Techniques",
    content: "Master TypeScript's advanced type system, including generics, conditional types, and mapped types. Improve your code quality and development efficiency.",
    email: "typescript@example.com",
    category: "Programming",
    type: "advanced",
    createdAt: "2024-01-19T15:45:00Z",
    imageUrl: "https://via.placeholder.com/400x300?text=TypeScript+Guide"
  },
  {
    id: 3,
    name: "UI/UX Design Principles",
    content: "Explore the core principles of modern UI/UX design, from user experience to visual hierarchy, creating excellent digital products.",
    email: "designer@example.com",
    category: "Design",
    type: "design",
    createdAt: "2024-01-18T09:15:00Z",
    imageUrl: "https://via.placeholder.com/400x300?text=UI+Design"
  }
];

const layouts = [
  { name: 'Card Layout', render: renderCustomCardLayout },
  { name: 'Blog Layout', render: renderBlogLayout },
  { name: 'Social Layout', render: renderSocialLayout },
  { name: 'Magazine Layout', render: renderMagazineLayout },
  { name: 'Minimal Layout', render: renderMinimalLayout }
];

function App() {
  const [currentLayout, setCurrentLayout] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLayoutChange = (index: number) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate loading delay
    setTimeout(() => {
      setCurrentLayout(index);
      setIsLoading(false);
    }, 500);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  const triggerError = () => {
    setError("Simulated network error: Failed to load data");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Layout Installer Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Experience different layout component rendering effects
          </p>
          
          {/* Layout selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {layouts.map((layout, index) => (
              <button
                key={index}
                onClick={() => handleLayoutChange(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentLayout === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {layout.name}
              </button>
            ))}
          </div>

          {/* Tool buttons */}
          <div className="flex gap-2">
            <button
              onClick={triggerError}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Trigger Error
            </button>
            <button
              onClick={() => handleLayoutChange(currentLayout)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              Reload
            </button>
          </div>
        </header>

        <main className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {error ? (
            <ErrorState error={error} onRetry={handleRetry} />
          ) : isLoading ? (
            <LoadingState />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Current Layout: {layouts[currentLayout].name}
                </h2>
                <span className="text-sm text-gray-500">
                  {mockData.length} records total
                </span>
              </div>
              
              {/* Render selected layout */}
              {layouts[currentLayout].render(mockData, {})}
            </div>
          )}
        </main>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Use <code className="bg-gray-100 px-2 py-1 rounded">@unilab/layout-installer</code> to quickly install layout components
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App; 
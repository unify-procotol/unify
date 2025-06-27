import React, { useState, useEffect } from 'react';
import { Layout, StudioHome } from "./components";
import StoryPage from "./components/StoryPage";

// Simple router implementation
export const Router: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation function
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Route components
  const renderRoute = () => {
    switch (currentPath) {
      case '/story':
        return <StoryPage />;
      case '/':
      default:
        return (
          <Layout>
            {({ isConnected, baseUrl }) => (
              <div className="flex flex-col h-screen">
                {/* Navigation Bar */}
                <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-lg font-semibold text-gray-200">Unify Studio</h1>
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate('/')}
                        className={`px-3 py-1.5 rounded text-sm transition-colors ${
                          currentPath === '/' 
                            ? 'bg-orange-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        Studio
                      </button>
                      <button
                        onClick={() => navigate('/story')}
                        className={`px-3 py-1.5 rounded text-sm transition-colors ${
                          currentPath === '/story' 
                            ? 'bg-orange-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        Storybook
                      </button>
                    </nav>
                  </div>
                  <div className="text-sm text-gray-400">
                    Current: <span className="text-gray-300">{currentPath}</span>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                  <StudioHome isConnected={isConnected} baseUrl={baseUrl} />
                </div>
              </div>
            )}
          </Layout>
        );
    }
  };

  return renderRoute();
};

export default Router; 
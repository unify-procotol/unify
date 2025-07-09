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
                <div className="h-12 bg-muted/50 border-b border-border flex items-center justify-between px-4">
                  <div className="flex items-center space-x-2">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate('/')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          currentPath === '/' 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        Studio
                      </button>
                      <button
                        onClick={() => navigate('/story')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          currentPath === '/story' 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        Storybook
                      </button>
                    </nav>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current: <span className="text-foreground font-medium">{currentPath}</span>
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
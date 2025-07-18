import React, { useState, useEffect } from 'react';
import { Layout, StudioHome } from "./components";
import { Chat } from "./components/Chat";

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
      case '/chat':
        return (
          <Layout>
            {() => (
              <div className="flex flex-col h-screen p-4">
                <Chat />
              </div>
            )}
          </Layout>
        );
      
      case '/embed-chat':
        // Embedded chat without full layout - for iframe usage
        return (
          <div className="h-screen bg-background">
            <Chat isEmbedded={true} />
          </div>
        );
      
      case '/':
      default:
        return (
          <Layout>
            {({ isConnected, baseUrl }) => (
              <div className="flex flex-col h-screen">
                {/* Main Content - Direct display without tabs */}
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
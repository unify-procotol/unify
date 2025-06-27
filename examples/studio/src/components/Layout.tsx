import { ReactNode, useState, useEffect } from "react";
import { repo, UnifyClient } from "@unilab/unify-client";

interface LayoutProps {
  children: ReactNode | ((props: { isConnected: boolean; baseUrl: string }) => ReactNode);
}

export function Layout({ children }: LayoutProps) {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputUrl, setInputUrl] = useState("http://localhost:3000");

  // Initialize connection on mount
  useEffect(() => {
    connectToServer(baseUrl);
  }, []);

  const connectToServer = async (url: string) => {
    setIsConnecting(true);
    try {
      UnifyClient.init({
        baseUrl: url,
        timeout: 10000,
      });
      
      // Test connection by making a simple request
      const response = await fetch(`${url}/health`).catch(() => null);
      setIsConnected(response?.ok || false);
      setBaseUrl(url);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    if (inputUrl.trim()) {
      connectToServer(inputUrl.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  };

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="h-16 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border-b border-gray-700/50 flex items-center justify-between px-6 shadow-lg">
        {/* Left Section - Logo and Brand */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Unify Studio
              </h1>
              <p className="text-xs text-gray-400 font-medium">Database Explorer</p>
            </div>
          </div>
        </div>

        {/* Center Section - Empty for spacing */}
        <div className="flex-1"></div>

        {/* Right Section - Connection Input Only */}
        <div className="flex items-center space-x-4">
          {/* Server Connection */}
          <div className="flex items-center space-x-3 bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4l4 4"/>
              </svg>
              <span className="text-sm text-gray-300 font-medium">Server</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-900/50 rounded-md px-3 py-1.5 border border-gray-600/30">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="http://localhost:3000"
                className="bg-transparent text-sm text-gray-200 placeholder-gray-500 border-none outline-none w-52 font-mono"
              />
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="text-sm px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-md transition-all duration-200 font-medium shadow-sm"
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Connecting</span>
                  </div>
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2 bg-gray-800/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/30">
            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
              isConnecting ? 'bg-yellow-400 animate-pulse shadow-yellow-400/50' :
              isConnected ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-red-400 shadow-red-400/50'
            }`}></div>
            <span className={`text-sm font-medium ${
              isConnecting ? 'text-yellow-300' :
              isConnected ? 'text-emerald-300' : 'text-red-300'
            }`}>
              {isConnecting ? 'Connecting...' :
               isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* No tab bar here - handled by StudioHome */}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pass connection state to children */}
        {typeof children === 'function' 
          ? children({ isConnected, baseUrl }) 
          : children
        }
      </div>
    </div>
  );
} 
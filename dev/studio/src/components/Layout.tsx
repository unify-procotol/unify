import { ReactNode, useState, useEffect } from "react";
import { repo, URPC } from "@unilab/urpc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";
import { Server, Loader2, Search, Terminal } from "lucide-react";

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
    // Check for endpoint in URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const endpointParam = urlParams.get('endpoint');
    
    if (endpointParam) {
      setInputUrl(endpointParam);
      connectToServer(endpointParam);
    } else {
      // Check localStorage for saved endpoint
      const savedEndpoint = localStorage.getItem('urpc-studio-endpoint');
      if (savedEndpoint) {
        setInputUrl(savedEndpoint);
        connectToServer(savedEndpoint);
      } else {
        connectToServer(baseUrl);
      }
    }
  }, []);

  const connectToServer = async (url: string) => {
    setIsConnecting(true);
    try {
      URPC.init({
        baseUrl: url,
        timeout: 10000,
      });
      
      // Test connection by making a URPC request to get schemas
      await repo<any>({
        entity: "schema",
        source: "_global",
      }).findMany();
      
      setIsConnected(true);
      setBaseUrl(url);
      
      // Save successful endpoint to localStorage
      localStorage.setItem('urpc-studio-endpoint', url);
    } catch (error) {
      console.error("Connection failed:", error);
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

  // Detect endpoint from URL or environment
  const detectEndpoint = () => {
    try {
      // Priority 1: Check URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const endpointParam = urlParams.get('endpoint');
      if (endpointParam) {
        setInputUrl(endpointParam);
        return;
      }

      // Priority 2: Check URL hash for endpoint
      const hash = window.location.hash;
      const hashMatch = hash.match(/[#&]endpoint=([^&]+)/);
      if (hashMatch) {
        const hashEndpoint = decodeURIComponent(hashMatch[1]);
        setInputUrl(hashEndpoint);
        return;
      }

      // Priority 3: Check localStorage for saved endpoint
      const savedEndpoint = localStorage.getItem('urpc-studio-endpoint');
      if (savedEndpoint && savedEndpoint !== inputUrl) {
        setInputUrl(savedEndpoint);
        return;
      }

      // Priority 4: Smart detection based on current environment
      const currentDomain = window.location.hostname;
      const currentProtocol = window.location.protocol;
      
      // Common development ports to try
      const commonPorts = ['3000', '8080', '3001', '5000', '4000', '8000', '9000'];
      
      // If on localhost or 127.0.0.1, try common dev ports
      if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
        for (const port of commonPorts) {
          const testUrl = `${currentProtocol}//${currentDomain}:${port}`;
          if (testUrl !== inputUrl) {
            setInputUrl(testUrl);
            return;
          }
        }
      } else {
        // For production domains, try the same domain with common ports
        const testUrl = `${currentProtocol}//${currentDomain}:3000`;
        if (testUrl !== inputUrl) {
          setInputUrl(testUrl);
          return;
        }
      }

      // Priority 5: Check common environment variables (if accessible)
      // This would work in development environments
      const envEndpoint = process.env.REACT_APP_URPC_ENDPOINT || process.env.NEXT_PUBLIC_URPC_ENDPOINT;
      if (envEndpoint && envEndpoint !== inputUrl) {
        setInputUrl(envEndpoint);
        return;
      }

      console.log('No endpoint detected, current URL remains:', inputUrl);
    } catch (error) {
      console.error('Error detecting endpoint:', error);
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Header */}
      <Card className="h-16 rounded-none border-x-0 border-t-0 flex items-center justify-between px-6">
        {/* Left Section - Logo and Brand */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                URPC Studio
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Database Explorer</p>
            </div>
          </div>
        </div>

        {/* Center Section - Empty for spacing */}
        <div className="flex-1"></div>

        {/* Right Section - Connection Input */}
        <div className="flex items-center space-x-4">
          {/* Server Connection */}
          <div className="flex items-center space-x-3 p-2">
            <div className="flex items-center space-x-2">
              {/* @ts-ignore */}
              <Server className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">Server</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="http://localhost:3000"
                className="w-52 h-8 font-mono text-sm border-0 bg-muted/50 focus:bg-background"
              />
              <Button
                onClick={detectEndpoint}
                disabled={isConnecting}
                variant="outline"
                size="sm"
                className="px-2 border-0 bg-muted/50 hover:bg-muted"
                title="Detect endpoint from URL or environment"
              >
                <Search className="w-3 h-3" />
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                size="sm"
                className="border-0"
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-1">
                    {/* @ts-ignore */}
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Connecting</span>
                  </div>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          </div>

          {/* Connection Status Indicator - Simplified to just dots */}
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              isConnecting && "bg-yellow-400 animate-pulse",
              isConnected && !isConnecting && "bg-green-400",
              !isConnected && !isConnecting && "bg-red-400"
            )}></div>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="w-full h-full">
        {/* Pass connection state to children */}
        {typeof children === 'function' 
          ? children({ isConnected, baseUrl }) 
          : children
        }
      </div>
    </div>
  );
} 
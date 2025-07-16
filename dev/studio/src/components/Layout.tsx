import { ReactNode, useState, useEffect } from "react";
import { repo, URPC } from "@unilab/urpc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";
import { Server, Loader2, Search, Terminal, ChevronDown, Check, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode | ((props: { isConnected: boolean; baseUrl: string }) => ReactNode);
}

export function Layout({ children }: LayoutProps) {
  const [baseUrl, setBaseUrl] = useState("https://hono-basic-example.uni-labs.org");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputUrl, setInputUrl] = useState("https://hono-basic-example.uni-labs.org");
  
  // Predefined server options
  const serverOptions = [
    { label: "Hono Basic Example", value: "https://hono-basic-example.uni-labs.org" },
  ];

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
        // Use the default inputUrl instead of baseUrl
        connectToServer(inputUrl);
      }
    }
  }, []);

  const connectToServer = async (url: string) => {
    setIsConnecting(true);
    console.log("Connecting to server:", url); // Debug log
    
    // Reset connection state
    setIsConnected(false);
    
    try {
      // Direct HTTP request to test connection instead of using URPC repo
      // This bypasses the URPC singleton issue
      const testUrl = `${url}/schema/list?source=_global`;
      console.log("Testing connection with direct fetch to:", testUrl); // Debug log
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log("Connection timeout after 10 seconds");
      }, 10000);
      
      try {
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Connection test successful, got data:", data); // Debug log
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError?.name === 'AbortError') {
          throw new Error('Connection timeout - server did not respond within 10 seconds');
        }
        throw fetchError;
      }
      
      // Now initialize URPC for future use
      // Create a new global URPC instance by forcing reset
      (URPC as any).globalInstance = null;
      URPC.init({
        baseUrl: url,
        timeout: 10000,
      });
      
      console.log("URPC reinitialized with baseUrl:", url); // Debug log
      
      setIsConnected(true);
      setBaseUrl(url);
      
      // Save successful endpoint to localStorage
      localStorage.setItem('urpc-studio-endpoint', url);
      console.log("Connection successful to:", url); // Debug log
    } catch (error) {
      console.error("Connection failed to:", url, error);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    if (inputUrl.trim()) {
      console.log("Manual connect to:", inputUrl.trim()); // Debug log
      connectToServer(inputUrl.trim());
    }
  };

  const handleServerSelect = (url: string) => {
    setInputUrl(url);
    connectToServer(url);
  };

  const clearCache = () => {
    localStorage.removeItem('urpc-studio-endpoint');
    console.log("Cache cleared");
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
              <div className="relative">
                <Input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://hono-basic-example.uni-labs.org"
                  className="w-52 h-8 font-mono text-sm border-0 bg-muted/50 focus:bg-background pr-8"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-muted"
                      title="Select from predefined servers"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {serverOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleServerSelect(option.value)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {option.value}
                          </span>
                        </div>
                        {inputUrl === option.value && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
              <Button
                onClick={clearCache}
                disabled={isConnecting}
                variant="outline"
                size="sm"
                className="px-2 border-0 bg-muted/50 hover:bg-muted"
                title="Clear cached server settings"
              >
                <Trash2 className="w-3 h-3" />
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
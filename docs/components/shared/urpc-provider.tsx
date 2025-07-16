"use client";

import { repo, URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { Logging } from "@unilab/urpc-core/middleware";
import { MemoryAdapter } from "@unilab/urpc-adapters";
import { useState, useEffect } from "react";
import { PostEntity } from "../entities/post";
import { UserEntity } from "../entities/user";

const MyPlugin: Plugin = {
  entities: [UserEntity, PostEntity],
  adapters: [
    {
      entity: "user",
      source: "memory",
      adapter: new MemoryAdapter(),
    },
    {
      entity: "post", 
      source: "memory",
      adapter: new MemoryAdapter(),
    },
  ],
};

// Global variable to track initialization status for current session
const GLOBAL_SESSION_KEY = '__urpc_session_initialized__';

export const getSessionInitialized = (): boolean => {
  if (typeof window !== 'undefined') {
    return (window as any)[GLOBAL_SESSION_KEY] || false;
  }
  return false;
};

export const setSessionInitialized = (value: boolean) => {
  if (typeof window !== 'undefined') {
    (window as any)[GLOBAL_SESSION_KEY] = value;
  }
};

export interface URPCProviderState {
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
  retryInitialization: () => void;
}

export const useURPCProvider = (): URPCProviderState => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeURPC = async () => {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Starting URPC initialization...");
      
      // Initialize URPC with explicit adapter configuration
      URPC.init({
        plugins: [MyPlugin],
        middlewares: [Logging()],
        entityConfigs: {
          user: {
            defaultSource: "memory",
          },
          post: {
            defaultSource: "memory",
          },
          schema: {
            defaultSource: "_global",
          },
        },
        // Don't use globalAdapters to avoid static export issues
        // globalAdapters: [MemoryAdapter],
      });

      console.log("URPC initialized, waiting for stabilization...");
      
      // Wait longer for URPC to fully stabilize
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("Testing URPC connection...");
      
      // Verify that the adapter is working by testing a simple call
      let testResult;
      try {
        testResult = await repo({ entity: "user" }).findMany();
        console.log("URPC verification successful, found records:", testResult.length);
      } catch (testError) {
        console.error("URPC verification failed:", testError);
        throw new Error(`URPC verification failed: ${testError instanceof Error ? testError.message : String(testError)}`);
      }

      // Check if data has been initialized in current session
      if (!getSessionInitialized()) {
        console.log("Creating initial mock data...");
        
        // Create user mock data
        const users = [
          {
            id: "1",
            name: "John Doe",
            email: "john.doe@example.com",
            role: "Admin",
            isActive: true,
            avatar: "https://example.com/avatar1.png",
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            role: "User",
            isActive: true,
            avatar: "https://example.com/avatar2.png",
          },
          {
            id: "3",
            name: "Bob Johnson",
            email: "bob.johnson@example.com",
            role: "Manager",
            isActive: false,
            avatar: "https://example.com/avatar3.png",
          },
        ];

        for (const user of users) {
          await repo({ entity: "user" }).create({ data: user });
        }

        // Create post mock data
        const images = [
          "https://media.daily.dev/image/upload/s--AC8ihwmO--/f_auto/v1746082658/posts/xjMewZTM2",
          "https://i0.wp.com/devjournal.info/wp-content/uploads/2025/05/minio-s3-image.png?fit=600%2C452&ssl=1",
          "https://flo-bit.dev/ui-kit/opengraph.png"
        ];

        const posts = [
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
            createdAt: new Date(Date.now() - 86400000).toISOString(),
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
            createdAt: new Date(Date.now() - 172800000).toISOString(),
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
            createdAt: new Date(Date.now() - 259200000).toISOString(),
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
            createdAt: new Date(Date.now() - 345600000).toISOString(),
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
            createdAt: new Date(Date.now() - 432000000).toISOString(),
            imageUrl: images[Math.floor(Math.random() * images.length)],
          }
        ];

        for (const post of posts) {
          await repo({ entity: "post" }).create({ data: post });
        }
        
        setSessionInitialized(true);
        console.log("Mock data created successfully");
      } else {
        console.log("Mock data already initialized in this session, skipping creation");
      }

      // Final verification that everything is working
      try {
        const testUsers = await repo({ entity: "user" }).findMany();
        const testPosts = await repo({ entity: "post" }).findMany();
        console.log(`URPC initialization complete. Users: ${testUsers.length}, Posts: ${testPosts.length}`);
        
        if (testUsers.length === 0 && testPosts.length === 0) {
          throw new Error("No data found after initialization");
        }
      } catch (finalTestError) {
        console.error("Final verification failed:", finalTestError);
        throw new Error(`Final verification failed: ${finalTestError instanceof Error ? finalTestError.message : String(finalTestError)}`);
      }

      setIsInitialized(true);
      console.log("URPC provider initialization successful!");
    } catch (err) {
      console.error("URPC initialization failed:", err);
      setError(err instanceof Error ? err.message : 'Failed to initialize URPC');
    } finally {
      setLoading(false);
    }
  };

  const retryInitialization = () => {
    setError(null);
    setIsInitialized(false);
  };

  useEffect(() => {
    if (!isInitialized) {
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeURPC();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  return {
    isInitialized,
    loading,
    error,
    retryInitialization,
  };
}; 
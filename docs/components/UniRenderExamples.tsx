"use client";

import { UniRender } from "@unilab/ukit";
import { repo, URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { MemoryAdapter } from "@unilab/urpc-adapters";
import { PostEntity } from "./entities/post";
import { UserEntity } from "./entities/user";
import { renderCustomCardLayout } from "./shared/custom-layouts";
import { renderMagazineLayout } from "./shared/custom-magazine-layout";
import { renderSocialLayout } from "./shared/custom-social-layout";
import { renderBlogLayout } from "./shared/custom-blog-layout";
import { renderMinimalLayout } from "./shared/custom-minimal-layout";
import { useEffect, useState, useRef } from "react";

let initialized = false;
let initPromise: Promise<boolean> | null = null;

export async function initUrpcClient() {
  if (initPromise) {
    return initPromise;
  }

  if (!initialized && typeof window !== "undefined") {
    initPromise = (async () => {
      try {
        const MyPlugin: Plugin = {
          entities: [UserEntity, PostEntity],
        };

        URPC.init({
          plugins: [MyPlugin],
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
          globalAdapters: [
            {
              source: "memory",
              factory: () => new MemoryAdapter(),
            },
          ],
        });

        // Create mock data
        await createMockData();

        initialized = true;
        return true;
      } catch (error) {
        console.error("Failed to initialize URPC:", error);
        initPromise = null;
        return false;
      }
    })();

    return initPromise;
  }

  return initialized;
}

async function createMockData() {
  try {
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
      "https://flo-bit.dev/ui-kit/opengraph.png",
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
        content:
          "Learn advanced techniques for optimizing React applications performance including memoization, virtualization, and code splitting strategies.",
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
        content:
          "A comprehensive guide to TypeScript generics, covering basic concepts to advanced patterns and real-world applications.",
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
        content:
          "Best practices for designing and implementing scalable REST APIs with proper authentication, caching, and monitoring.",
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
        content:
          "Master CSS Grid layout with practical examples and advanced techniques for creating responsive layouts.",
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
        content:
          "Proven strategies for optimizing database performance including indexing, query optimization, and schema design.",
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
        content:
          "Explore the latest JavaScript features including async/await, destructuring, modules, and more.",
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        imageUrl: images[Math.floor(Math.random() * images.length)],
      },
    ];

    for (const post of posts) {
      await repo({ entity: "post" }).create({ data: post });
    }

    console.log("Mock data created successfully");
  } catch (err) {
    console.error("Failed to create mock data:", err);
  }
}

interface ExampleProps {
  type:
    | "basic"
    | "table-editable"
    | "card"
    | "form"
    | "grid"
    | "list"
    | "dashboard"
    | "loading"
    | "error"
    | "empty"
    | "custom-basic"
    | "custom-magazine"
    | "custom-social"
    | "custom-blog"
    | "custom-minimal";
}

export function UniRenderExample({ type }: ExampleProps) {
  const uniRenderRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const success = await initUrpcClient();
        if (success) {
          setIsInitialized(true);

          // Call refresh after initialization is complete and component is mounted
          setTimeout(() => {
            if (uniRenderRef.current?.refresh) {
              uniRenderRef.current.refresh();
            }
          }, 100);
        } else {
          setInitError("Failed to initialize URPC client");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setInitError(
          error instanceof Error
            ? error.message
            : "Unknown initialization error"
        );
      }
    };

    init();
  }, []);

  if (initError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Initialization Error
          </div>
          <p className="text-gray-600">{initError}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-foreground font-medium">Initializing...</div>
          <div className="text-muted-foreground text-sm mt-1">
            Please wait, loading URPC client
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = async (updatedRecord: any, index: number) => {
    console.log("Updated record:", updatedRecord);
  };

  const handleDelete = async (record: any, index: number) => {
    console.log("Deleted record:", record);
  };

  const examples = {
    basic: {
      entity: UserEntity,
      source: "memory",
      layout: "table" as const,
      config: {
        id: { label: "ID", width: "60px" },
        name: { label: "Full Name" },
        email: { label: "Email Address" },
        role: { label: "Role" },
        isActive: {
          label: "Status",
          render: (value: boolean) => (
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value ? "Active" : "Inactive"}
            </span>
          ),
        },
      },
      generalConfig: {
        showActions: true,
        actions: {
          edit: true,
          delete: true,
        },
      },
    },
    "table-editable": {
      entity: UserEntity,
      layout: "table" as const,
      config: {
        id: { label: "ID", width: "60px", editable: false },
        name: {
          label: "Full Name",
          editable: true,
          required: true,
          type: "text",
        },
        email: {
          label: "Email Address",
          editable: true,
          required: true,
          type: "email",
        },
        role: {
          label: "Role",
          editable: true,
          type: "select",
          options: ["Admin", "User", "Manager"],
        },
        isActive: {
          label: "Status",
          editable: true,
          type: "checkbox",
          render: (value: boolean) => (
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value ? "Active" : "Inactive"}
            </span>
          ),
        },
      },
      generalConfig: {
        editable: true,
        showActions: true,
        actions: {
          edit: true,
          delete: true,
        },
      },
      onEdit: handleEdit,
      onDelete: handleDelete,
    },
    card: {
      entity: UserEntity,
      layout: "card" as const,
      config: {
        name: {
          label: "Name",
          render: (value: string) => (
            <span className="text-lg font-bold text-gray-900">{value}</span>
          ),
        },
        role: {
          label: "Role",
          render: (value: string) => (
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                value === "Admin"
                  ? "bg-purple-100 text-purple-800"
                  : value === "Manager"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              {value}
            </span>
          ),
        },
        email: {
          label: "Email",
          render: (value: string) => (
            <span className="text-sm text-gray-600">{value}</span>
          ),
        },
        isActive: {
          label: "Status",
          render: (value: boolean) => (
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value ? "Active" : "Inactive"}
            </span>
          ),
        },
      },
    },
    form: {
      entity: UserEntity,
      query: {
        where: { id: "1" },
      },
      layout: "form" as const,
      config: {
        name: { label: "Full Name" },
        email: { label: "Email Address" },
        role: { label: "Role" },
        isActive: {
          label: "Active Status",
          render: (value: boolean) => (
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value ? "Active" : "Inactive"}
            </span>
          ),
        },
      },
    },
    grid: {
      entity: UserEntity,
      layout: "grid" as const,
      config: {
        name: { label: "Name" },
        role: {
          label: "Role",
          render: (value: string) => (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {value}
            </span>
          ),
        },
        email: {
          label: "Email",
          render: (value: string) => (
            <span className="text-sm text-gray-600">{value}</span>
          ),
        },
        isActive: {
          label: "Status",
          render: (value: boolean) => (
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value ? "✅ Active" : "❌ Inactive"}
            </span>
          ),
        },
      },
    },
    list: {
      entity: UserEntity,
      layout: "list" as const,
      config: {
        name: { label: "Name" },
        email: { label: "Email" },
        role: { label: "Role" },
        isActive: {
          label: "Status",
          render: (value: boolean) => (
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value ? "Active" : "Inactive"}
            </span>
          ),
        },
      },
    },
    dashboard: {
      entity: UserEntity,
      layout: "dashboard" as const,
      config: {
        name: { label: "User" },
        role: {
          label: "Role",
          render: (value: string) => value,
        },
        email: {
          label: "Email",
          render: (value: string) => value,
        },
        isActive: {
          label: "Status",
          render: (value: boolean) => (
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value ? "Active" : "Inactive"}
            </span>
          ),
        },
      },
    },
    loading: {
      entity: UserEntity,
      layout: "table" as const,
      loading: true,
    },
    error: {
      entity: UserEntity,
      layout: "table" as const,
      loading: false,
      error: "Failed to load orders: Network connection timeout",
    },
    empty: {
      entity: UserEntity,
      query: {
        where: { id: "nonexistent" },
      },
      layout: "table" as const,
      loading: false,
      error: null,
    },
    "custom-basic": {
      entity: PostEntity,
      layout: "custom" as const,
      render: renderCustomCardLayout,
      config: {
        name: { label: "Title" },
        content: { label: "Content" },
        role: { label: "Role" },
        type: { label: "Type" },
        category: { label: "Category" },
        status: { label: "Status" },
        isActive: { label: "Active" },
        createdAt: { label: "Created" },
      },
      pagination: {
        enabled: true,
        pageSize: 6,
      },
      onEdit: handleEdit,
      onDelete: handleDelete,
    },
    "custom-magazine": {
      entity: PostEntity,
      layout: "custom" as const,
      render: renderMagazineLayout,
      config: {
        name: { label: "Article Title" },
        content: { label: "Content" },
        role: { label: "Department" },
        type: { label: "Type" },
        category: { label: "Category" },
        status: { label: "Status" },
      },
      pagination: {
        enabled: true,
        pageSize: 8,
      },
      onEdit: handleEdit,
      onDelete: handleDelete,
    },
    "custom-social": {
      entity: PostEntity,
      layout: "custom" as const,
      render: renderSocialLayout,
      config: {
        name: { label: "Post Title" },
        content: { label: "Content" },
        role: { label: "User Role" },
        type: { label: "Post Type" },
        category: { label: "Category" },
        status: { label: "Status" },
      },
      pagination: {
        enabled: true,
        pageSize: 3,
      },
      onEdit: handleEdit,
      onDelete: handleDelete,
    },
    "custom-blog": {
      entity: PostEntity,
      layout: "custom" as const,
      render: renderBlogLayout,
      config: {
        name: { label: "Blog Title" },
        content: { label: "Content" },
        role: { label: "Author Role" },
        type: { label: "Post Type" },
        category: { label: "Category" },
        status: { label: "Status" },
      },
      pagination: {
        enabled: true,
        pageSize: 4,
      },
      onEdit: handleEdit,
      onDelete: handleDelete,
    },
    "custom-minimal": {
      entity: PostEntity,
      layout: "custom" as const,
      render: renderMinimalLayout,
      config: {
        name: { label: "Title" },
        content: { label: "Description" },
        role: { label: "Role" },
        status: { label: "Status" },
      },
      pagination: {
        enabled: true,
        pageSize: 8,
      },
      onEdit: handleEdit,
      onDelete: handleDelete,
    },
  };

  const baseProps = examples[type];

  // Dynamically create final props to avoid type errors
  const finalProps: any = { ...baseProps };

  // For special states, keep as is
  if (type === "loading") {
    finalProps.loading = true;
  } else if (type === "error") {
    finalProps.loading = false;
    finalProps.error = "Failed to load orders: Network connection timeout";
  } else if (type === "empty") {
    finalProps.loading = false;
    finalProps.error = null;
  } else {
    // For normal examples, no loading state needed
    finalProps.loading = false;
    finalProps.error = null;
  }

  // Ensure required properties exist
  finalProps.entity = finalProps.entity;
  finalProps.source = finalProps.source;
  finalProps.layout = finalProps.layout;

  // Add debug information
  if (process.env.NODE_ENV === "development") {
    console.log("UniRender props:", finalProps);
  }

  console.log("About to render UniRender component!!!!!!!!!!!!", {
    isInitialized,
    initError,
    type,
    finalProps,
  });

  return <UniRender ref={uniRenderRef} {...finalProps} />;
}

// Export with backward compatibility
export { UniRenderExample as UniRenderCustomLayout };

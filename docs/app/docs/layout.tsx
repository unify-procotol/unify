import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import {
  Book,
  Database,
  LayoutGrid,
  Plug,
  SquarePlay,
  Webhook,
} from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      sidebar={{
        tabs: [
          {
            title: "Docs",
            description: "get started and plugins",
            url: "/docs/introduction",
            icon: <Book />,
            urls: new Set([
              "/docs/introduction",
              "/docs/installation",
              "/docs/basic-usage",
              "/docs/integrations/next",
              "/docs/integrations/hono",
              "/docs/plugins/uniweb3",
              "/docs/middleware/hook",
              "/docs/middleware/logging",
              "/docs/reference/options",
              "/docs/reference/contributing",
            ]),
          },
          {
            title: "Examples",
            description: "examples and guides",
            url: "/docs/examples/next",
            icon: <SquarePlay />,
            urls: new Set(["/docs/examples/next"]),
          },
        ],
      }}
      tree={{
        name: "docs",
        children: [
          {
            type: "folder",
            name: "Get Started",
            children: [
              {
                type: "page",
                name: "Introduction",
                url: "/docs/introduction",
              },
              {
                type: "page",
                name: "Installation",
                url: "/docs/installation",
              },
              {
                type: "page",
                name: "Basic Usage",
                url: "/docs/basic-usage",
              },
            ],
            icon: <Book />,
          },
          {
            type: "folder",
            name: "Integrations",
            children: [
              {
                type: "page",
                name: "Next",
                url: "/docs/integrations/next",
              },
              {
                type: "page",
                name: "Hono",
                url: "/docs/integrations/hono",
              },
            ],
            icon: <LayoutGrid />,
          },
          {
            type: "folder",
            name: "Plugins",
            children: [
              {
                type: "page",
                name: "UniWeb3",
                url: "/docs/plugins/uniweb3",
              },
            ],
            icon: <Plug />,
          },
          {
            type: "folder",
            name: "Middleware",
            children: [
              {
                type: "page",
                name: "Hook",
                url: "/docs/middleware/hook",
              },
              {
                type: "page",
                name: "Logging",
                url: "/docs/middleware/logging",
              },
            ],
            icon: <Webhook />,
          },
          {
            type: "folder",
            name: "Relations",
            children: [
              {
                type: "page",
                name: "Relations",
                url: "/docs/relations",
              },
            ],
            icon: <LayoutGrid />,
          },
          {
            type: "folder",
            name: "Reference",
            children: [
              {
                type: "page",
                name: "Options",
                url: "/docs/reference/options",
              },
              {
                type: "page",
                name: "Contributing",
                url: "/docs/reference/contributing",
              },
            ],
            icon: <Book />,
          },
          {
            type: "folder",
            name: "Examples",
            children: [
              {
                type: "page",
                name: "Next.js",
                url: "/docs/examples/next",
              },
            ],
            icon: <SquarePlay />,
            root: true,
          },
        ],
      }}
      {...baseOptions}
    >
      {children}
    </DocsLayout>
  );
}

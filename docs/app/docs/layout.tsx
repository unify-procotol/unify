import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { Book, Database, LayoutGrid, Plug } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
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
            name: "Storage",
            children: [
              {
                type: "page",
                name: "Local File Storage",
                url: "/docs/storage/local-file-storage",
              },
              {
                type: "page",
                name: "PostgreSQL",
                url: "/docs/storage/postgresql",
              },
            ],
            icon: <Database />,
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
        ],
      }}
      {...baseOptions}
    >
      {children}
    </DocsLayout>
  );
}

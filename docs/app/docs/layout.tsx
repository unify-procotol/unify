import { DocsLayout } from "fumadocs-ui/layouts/docs";
import React from "react";
import { baseOptions, linkItems } from "@/app/layout.config";
import { Book } from "lucide-react";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      links={linkItems.filter((item) => item.type === "icon")}
      tree={source.pageTree}
      sidebar={{
        tabs: {
          transform: (option, node) => ({
            ...option,
            icon: <Book />,
          }),
        },
      }}
      {...baseOptions}
    >
      {children}
    </DocsLayout>
  );
}

import { defineConfig } from "vocs";

export default defineConfig({
  title: "Unify API",
  description:
    "A Hono-based SDK that maps entity configurations to REST API endpoints",
  // logoUrl: "/logo.svg",
  // iconUrl: "/favicon.ico",
  sidebar: [
    {
      text: "Getting Started",
      link: "/getting-started",
    },
    {
      text: "Examples",
      collapsed: false,
      items: [
        {
          text: "Basic Usage",
          link: "/examples/basic-usage",
        },
        {
          text: "Next.js Integration",
          link: "/examples/nextjs",
        },
        {
          text: "Middleware",
          link: "/examples/middleware",
        },
      ],
    },
    {
      text: "API Reference",
      collapsed: false,
      items: [
        {
          text: "Core API",
          link: "/api/core",
        },
        {
          text: "Entity Methods",
          link: "/api/entity-methods",
        },
        {
          text: "Query Parameters",
          link: "/api/query-parameters",
        },
        {
          text: "Table Configuration",
          link: "/api/table-config",
        },
      ],
    },
  ],
  socials: [
    {
      icon: "github",
      link: "https://github.com/iotexproject/unify-api",
    },
  ],
});

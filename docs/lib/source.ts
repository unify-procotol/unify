import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";
import { attachFile } from "fumadocs-openapi/server";

// Detect if the system is Windows
const isWindows = typeof process !== 'undefined' && process.platform === 'win32';

// Windows path normalization function
function normalizeWindowsPaths(source: any) {
  // If not Windows system, return original source directly
  if (!isWindows) {
    return source;
  }

  // Create a deep copy and fix paths (Windows only)
  const normalizedSource = {
    ...source,
    getPages: () => {
      return source.getPages().map((page: any) => ({
        ...page,
        url: page.url?.replace(/\\/g, '/'),
        slugs: page.slugs?.map((slug: string) => slug.replace(/\\/g, '/'))
      }));
    },
    getPage: (slugs?: string[]) => {
      if (!slugs) return source.getPage();
      
      // Try original path
      let page = source.getPage(slugs);
      if (page) return page;
      
      // If not found, try Windows path format
      const windowsSlugs = slugs.map(slug => slug.replace(/\//g, '\\'));
      page = source.getPage(windowsSlugs);
      if (page) return page;
      
      // If still not found, try mixed format
      const pages = source.getPages();
      for (const p of pages) {
        const normalizedSlugs = p.slugs?.map((s: string) => s.replace(/\\/g, '/'));
        if (normalizedSlugs && 
            normalizedSlugs.length === slugs.length && 
            normalizedSlugs.every((s: string, i: number) => s === slugs[i])) {
          return p;
        }
      }
      
      return null;
    },
    generateParams: () => {
      return source.generateParams().map((param: any) => ({
        ...param,
        slug: param.slug?.map((s: string) => s.replace(/\\/g, '/'))
      }));
    }
  };
  
  return normalizedSource;
}

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/docs",
  icon(icon) {
    if (icon && icon in icons)
      return createElement(icons[icon as keyof typeof icons]) as any;
  },
  source: normalizeWindowsPaths(docs.toFumadocsSource()),
  pageTree: {
    attachFile,
  },
});

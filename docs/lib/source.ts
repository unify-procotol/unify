import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";
import { attachFile } from "fumadocs-openapi/server";

// 检测是否为 Windows 系统
const isWindows = typeof process !== 'undefined' && process.platform === 'win32';

// Windows 路径标准化函数
function normalizeWindowsPaths(source: any) {
  // 如果不是 Windows 系统，直接返回原始 source
  if (!isWindows) {
    return source;
  }

  // 创建一个深拷贝并修复路径（仅 Windows）
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
      
      // 尝试原始路径
      let page = source.getPage(slugs);
      if (page) return page;
      
      // 如果找不到，尝试 Windows 路径格式
      const windowsSlugs = slugs.map(slug => slug.replace(/\//g, '\\'));
      page = source.getPage(windowsSlugs);
      if (page) return page;
      
      // 如果还是找不到，尝试混合格式
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

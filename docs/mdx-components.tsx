import defaultMdxComponents from "fumadocs-ui/mdx";
import * as FilesComponents from "fumadocs-ui/components/files";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import * as CalloutComponents from "fumadocs-ui/components/callout";
import type { MDXComponents } from "mdx/types";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Step, Steps } from "fumadocs-ui/components/steps";
import * as icons from "lucide-react";
import { DemoCard, DemoGrid } from "@/app/(home)/components/demo-card";
import { ClientUniRender } from "@/components/ClientUniRender";
import { UniRenderExample } from "@/components/UniRenderExamples";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...(icons as unknown as MDXComponents),
    ...defaultMdxComponents,
    ...TabsComponents,
    ...FilesComponents,
    ...CalloutComponents,
    Accordion,
    Accordions,
    Step,
    Steps,
    DemoCard,
    DemoGrid,
    ...components,
    UniRender: ClientUniRender,
    UniRenderExample,
  } as any;
}

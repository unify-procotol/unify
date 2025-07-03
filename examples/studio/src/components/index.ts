// Studio Components Export
export { Layout } from './Layout';
export { StudioHome } from './StudioHome';
export { default as StoryPage } from './StoryPage';
export { UniRender } from '@unify/ui';

// Types
export interface EntityData {
  entityName: string;
  data: any[];
  loading: boolean;
  error: string | null;
}

export interface EntitySchema {
  name: string;
  schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface EntitiesInfo {
  adapters: string[];
  entities: string[];
  combinations: { entity: string; adapter: string }[];
} 
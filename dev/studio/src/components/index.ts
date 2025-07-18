// Studio Components Export
export { Layout } from './Layout';
export { StudioHome } from './StudioHome';
export { Chat } from './Chat';
export { UniRender } from '@unilab/ukit';

// Types
export interface EntityData {
  entity: string;
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
// Studio Components Export
export { Layout } from './Layout';
export { StudioHome } from './StudioHome';

// Types
export interface EntityData {
  entity: string;
  adapter: string;
  data: any[];
  loading: boolean;
  error: string | null;
}

export interface EntitiesInfo {
  adapters: string[];
  entities: string[];
  combinations: { entity: string; adapter: string }[];
} 
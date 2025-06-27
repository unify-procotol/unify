import { ReactNode } from "react";

// Layout types
export type LayoutType = 'table' | 'form' | 'card' | 'grid' | 'list' | 'dashboard';

// Field configuration interface
export interface FieldConfig {
  order?: number;
  label?: string;
  hidden?: boolean;
  render?: (value: any, record: any, index: number) => ReactNode;
  editable?: boolean;
  required?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'date';
  options?: string[]; // For select type
}

// Entity field schema
export interface EntityField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

// Entity schema interface
export interface Entity {
  name: string;
  fields: EntityField[];
  schema?: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

// General configuration interface
export interface GeneralConfig {
  editable?: boolean;
  showActions?: boolean;
  actions?: {
    edit?: boolean;
    delete?: boolean;
    custom?: Array<{
      label: string;
      icon?: ReactNode;
      onClick: (record: any, index: number) => void;
      className?: string;
    }>;
  };
}

// UniRender props interface
export interface UniRenderProps {
  entity: Entity;
  data: any[];
  layout: LayoutType;
  config?: Record<string, FieldConfig>;
  generalConfig?: GeneralConfig;
  loading?: boolean;
  error?: string | null;
  onAdd?: (record: any) => Promise<void> | void;
  onEdit?: (record: any, index: number) => Promise<void> | void;
  onDelete?: (record: any, index: number) => Promise<void> | void;
  onSave?: (record: any, index: number) => Promise<void> | void;
  className?: string;
}

// Layout component props interface
export interface LayoutProps {
  entity: Entity;
  data: any[];
  config?: Record<string, FieldConfig>;
  generalConfig?: GeneralConfig;
  onEdit?: (record: any, index: number) => Promise<void> | void;
  onDelete?: (record: any, index: number) => Promise<void> | void;
  onSave?: (record: any, index: number) => Promise<void> | void;
} 
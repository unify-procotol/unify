import { ReactNode } from "react";

/**
 * Available layout types for rendering data
 */
export type LayoutType = 'table' | 'form' | 'card' | 'grid' | 'list' | 'dashboard' | 'custom';

/**
 * Configuration for individual fields
 */
export interface FieldConfig {
  /** Display order of the field (lower numbers appear first) */
  order?: number;
  /** Custom label for the field */
  label?: string;
  /** Whether to hide this field from display */
  hidden?: boolean;
  /** Custom render function for the field value */
  render?: (value: any, record: any, index: number) => ReactNode;
  /** Whether the field can be edited */
  editable?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Width of the field column */
  width?: string | number;
  /** Text alignment for the field */
  align?: 'left' | 'center' | 'right';
  /** Input type for editing */
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'date';
  /** Options for select type fields */
  options?: string[];
}

/**
 * Entity field schema definition
 */
export interface EntityField {
  /** Field name */
  name: string;
  /** Field data type */
  type: string;
  /** Whether the field is required */
  required?: boolean;
  /** Field description */
  description?: string;
}

/**
 * Entity schema interface
 */
export interface Entity {
  /** Entity name */
  name: string;
  /** Array of field definitions */
  fields: EntityField[];
  /** JSON schema for validation (optional) */
  schema?: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * General configuration for the renderer
 */
export interface GeneralConfig {
  /** Whether records can be edited */
  editable?: boolean;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Action button configuration */
  actions?: {
    /** Whether to show edit action */
    edit?: boolean;
    /** Whether to show delete action */
    delete?: boolean;
    /** Custom actions */
    custom?: Array<{
      label: string;
      icon?: ReactNode;
      onClick: (record: any, index: number, entityInstance: any, refresh: () => Promise<void>) => Promise<void> | void;
      className?: string;
    }>;
  };
  
  // Global layout configuration
  /** Whether to show the add record button (applies to all layouts) */
  showAddButton?: boolean;
  /** Whether to show top controls (title, add button) (applies to all layouts) */
  showTopControls?: boolean;
  
  // Table-specific configuration
  table?: {
    /** Whether to enable pagination */
    enablePagination?: boolean;
    /** Number of records per page */
    pageSize?: number;
    /** Whether to show the add record button (overrides global showAddButton) */
    showAddButton?: boolean;
    /** Whether to show top controls (title, add button) (overrides global showTopControls) */
    showTopControls?: boolean;
    /** Whether to show filter controls */
    showFilter?: boolean;
    /** Filter configuration */
    filterConfig?: {
      showFieldFilter?: boolean;
      showSearch?: boolean;
      showToggle?: boolean;
      placeholder?: string;
      defaultExpanded?: boolean;
    };
  };
  
  // Empty state configuration
  emptyState?: {
    /** Whether to show add record button in empty state */
    showAddButton?: boolean;
  };
}

/**
 * Query parameters for data fetching
 */
export interface QueryParams {
  /** WHERE clause for filtering */
  where?: Record<string, any>;
  /** Fields to include in the response */
  select?: string[];
  /** Number of records to skip */
  skip?: number;
  /** Number of records to limit */
  limit?: number;
  /** Sorting configuration */
  orderBy?: Record<string, 'asc' | 'desc'>;
  /** Include relations */
  include?: Record<string, any>;
}

/**
 * Main props interface for UniRender component
 */
export interface UniRenderProps {
  /** Entity name (string) or Entity class */
  entity: string | any;
  /** Data source (optional) */
  source?: string;
  /** Query parameters for data fetching */
  query?: QueryParams;
  /** Layout type for rendering */
  layout: LayoutType;
  /** Field-specific configuration */
  config?: Record<string, FieldConfig>;
  /** General configuration */
  generalConfig?: GeneralConfig;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Callback when adding a new record */
  onAdd?: (record: any) => Promise<void> | void;
  /** Callback when editing a record */
  onEdit?: (record: any, index: number) => Promise<void> | void;
  /** Callback when deleting a record */
  onDelete?: (record: any, index: number) => Promise<void> | void;
  /** Callback when saving changes */
  onSave?: (record: any, index: number) => Promise<void> | void;
  /** Additional CSS class names */
  className?: string;
  
  // Custom layout specific props
  /** Custom render function for custom layout */
  render?: (data: any[], options: {
    fields: EntityField[];
    config: Record<string, FieldConfig>;
    generalConfig: GeneralConfig;
    onEdit: (record: any, index: number) => void;
    onDelete: (record: any, index: number) => void;
    createActionHandler: (action: any, record: any, index: number) => () => Promise<void>;
    deletingIndex: number | null;
    currentPage: number;
    pageSize: number;
    startIndex: number;
    endIndex: number;
    totalRecords: number;
  }) => ReactNode;
  
  /** Pagination configuration for custom layout */
  pagination?: {
    enabled?: boolean;
    pageSize?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
  };
}

/**
 * Props interface for layout components
 */
export interface LayoutProps {
  /** Entity schema definition */
  entity: Entity;
  /** Array of data records to display */
  data: any[];
  /** Field-specific configuration */
  config?: Record<string, FieldConfig>;
  /** General configuration */
  generalConfig?: GeneralConfig;
  /** Callback when editing a record */
  onEdit?: (record: any, index: number) => Promise<void> | void;
  /** Callback when deleting a record */
  onDelete?: (record: any, index: number) => Promise<void> | void;
  /** Callback when saving changes */
  onSave?: (record: any, index: number) => Promise<void> | void;
}

/**
 * Props interface for EditModal component
 */
export interface EditModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Record to edit */
  record: any;
  /** Entity schema definition */
  entity: Entity;
  /** Field-specific configuration */
  config?: Record<string, FieldConfig>;
  /** Callback when saving changes */
  onSave?: (record: any, index: number) => Promise<void> | void;
  /** Index of the record being edited */
  index: number;
  /** Mode of the modal (edit or add) */
  mode?: 'edit' | 'add';
} 
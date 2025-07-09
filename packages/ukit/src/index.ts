// Main component
export { UniRender } from './components/UniRender';

// Types
export type {
  LayoutType,
  FieldConfig,
  EntityField,
  Entity,
  GeneralConfig,
  UniRenderProps,
  LayoutProps,
  EditModalProps
} from './types';

// Ref interfaces
export type { UniRenderRef } from './components/UniRender';

// Layout components (for advanced usage)
export { TableLayout } from './components/TableLayout';
export { FormLayout } from './components/FormLayout';
export { CardLayout } from './components/CardLayout';
export { GridLayout } from './components/GridLayout';
export { ListLayout } from './components/ListLayout';
export { DashboardLayout } from './components/DashboardLayout';
export { EditModal } from './components/EditModal';

// UI components (for custom styling)
export { Button } from './components/ui/button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/card';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Badge } from './components/ui/badge';
export { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption 
} from './components/ui/table';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';

// Utilities
export { 
  getSortedFields, 
  renderFieldValue, 
  cn, 
  generateRecordKey, 
  validateFieldValue 
} from './utils'; 
import React from 'react';
import { Button } from '../ui/button';
import { Edit3, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';

interface ActionButtonsProps {
  record: any;
  index: number;
  generalConfig?: any;
  onEdit?: (record: any, index: number) => void;
  onDelete?: (record: any, index: number) => void;
  deletingIndex?: number | null;
  createActionHandler: (action: any, record: any, index: number) => () => Promise<void>;
  size?: 'sm' | 'default';
  className?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  record,
  index,
  generalConfig,
  onEdit,
  onDelete,
  deletingIndex,
  createActionHandler,
  size = 'sm',
  className = ''
}) => {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-3 w-3';
  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-6 w-6';

  return (
    <div className={`flex items-center space-x-1 transition-opacity duration-200 ${className}`}>
      {/* Edit button */}
      {(generalConfig?.actions?.edit !== false && onEdit) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(record, index)}
          className={`${buttonSize} p-0`}
          title="Edit record"
        >
          <Edit3 className={iconSize} />
        </Button>
      )}
      
      {/* Delete button */}
      {(generalConfig?.actions?.delete !== false && onDelete) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(record, index)}
          disabled={deletingIndex === index}
          className={`${buttonSize} p-0 text-destructive hover:text-destructive`}
          title="Delete record"
        >
          {deletingIndex === index ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : (
            <Trash2 className={iconSize} />
          )}
        </Button>
      )}
      
      {/* Custom actions */}
      {generalConfig?.actions?.custom?.map((action: any, actionIndex: number) => (
        <Button
          key={actionIndex}
          variant="ghost"
          size="sm"
          onClick={createActionHandler(action, record, index)}
          className={`${buttonSize} p-0 ${action.className || ''}`}
          title={action.label}
        >
          {action.icon || <MoreHorizontal className={iconSize} />}
        </Button>
      ))}
    </div>
  );
}; 
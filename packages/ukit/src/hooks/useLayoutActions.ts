import { useState } from 'react';
import { Entity } from '../types';

interface UseLayoutActionsProps {
  onEdit?: (record: any, index: number) => Promise<void> | void;
  onDelete?: (record: any, index: number) => Promise<void> | void;
  onAddRecord?: (record: any) => Promise<void>;
  entityInstance?: any;
  generalConfig?: any;
  onRefresh?: () => Promise<void>;
}

export const useLayoutActions = ({
  onEdit,
  onDelete,
  onAddRecord,
  entityInstance,
  generalConfig,
  onRefresh
}: UseLayoutActionsProps) => {
  const [editingRecord, setEditingRecord] = useState<{ record: any; index: number } | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ record: any; index: number } | null>(null);

  /**
   * Handle edit action for a record
   */
  const handleEdit = (record: any, index: number) => {
    setEditingRecord({ record, index });
  };

  /**
   * Handle delete action for a record
   */
  const handleDelete = (record: any, index: number) => {
    if (!onDelete) {
      return;
    }
    setDeleteConfirmation({ record, index });
  };

  /**
   * Confirm delete action
   */
  const confirmDelete = async () => {
    if (!deleteConfirmation || !onDelete) {
      return;
    }
    
    const { record, index } = deleteConfirmation;
    setDeletingIndex(index);
    try {
      await onDelete(record, index);
      
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      // TODO: Show error message to user
    } finally {
      setDeletingIndex(null);
      setDeleteConfirmation(null);
    }
  };

  /**
   * Handle save edit action
   */
  const handleSaveEdit = async (updatedRecord: any, index: number) => {
    if (!onEdit) return;
    await onEdit(updatedRecord, index);
    setEditingRecord(null);
    
    // Auto refresh data while preserving pagination state
    if (onRefresh) {
      await onRefresh();
    }
  };

  /**
   * Handle add record action
   */
  const handleAddRecord = () => {
    setShowAddModal(true);
  };

  /**
   * Handle save new record
   */
  const handleSaveRecord = async (newRecord: any, index: number) => {
    if (!onAddRecord) return;
    
    try {
      await onAddRecord(newRecord);
      setShowAddModal(false);
      
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Create action button onClick handler
   */
  const createActionHandler = (action: any, record: any, index: number) => {
    return async () => {
      try {
        const refresh = onRefresh || (() => Promise.resolve());
        if (entityInstance) {
          const instance = await entityInstance(record);
          await action.onClick(record, index, instance, refresh);
        } else {
          await action.onClick(record, index, null, refresh);
        }
      } catch (error) {
        // Handle error silently
      }
    };
  };

  return {
    // States
    editingRecord,
    deletingIndex,
    showAddModal,
    deleteConfirmation,
    
    // Actions
    handleEdit,
    handleDelete,
    confirmDelete,
    handleSaveEdit,
    handleAddRecord,
    handleSaveRecord,
    createActionHandler,
    
    // Setters for modal control
    setEditingRecord,
    setShowAddModal,
    setDeleteConfirmation
  };
}; 
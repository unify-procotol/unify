import React from 'react';
import { EditModal } from './EditModal';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Loader2 } from 'lucide-react';
import { Entity } from '../../types';

interface CommonModalsProps {
  // Edit Modal props
  editingRecord: { record: any; index: number } | null;
  setEditingRecord: (record: { record: any; index: number } | null) => void;
  entity: Entity;
  config?: Record<string, any>;
  handleSaveEdit: (updatedRecord: any, index: number) => Promise<void>;
  
  // Add Modal props
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  handleSaveRecord: (newRecord: any, index: number) => Promise<void>;
  
  // Delete Modal props
  deleteConfirmation: { record: any; index: number } | null;
  setDeleteConfirmation: (confirmation: { record: any; index: number } | null) => void;
  confirmDelete: () => Promise<void>;
  deletingIndex: number | null;
}

export const CommonModals: React.FC<CommonModalsProps> = ({
  editingRecord,
  setEditingRecord,
  entity,
  config,
  handleSaveEdit,
  showAddModal,
  setShowAddModal,
  handleSaveRecord,
  deleteConfirmation,
  setDeleteConfirmation,
  confirmDelete,
  deletingIndex
}) => {
  return (
    <>
      {/* Edit Modal */}
      {editingRecord && entity && entity.fields && entity.fields.length > 0 && (
        <EditModal
          isOpen={true}
          onClose={() => setEditingRecord(null)}
          record={editingRecord.record}
          entity={entity}
          config={config}
          onSave={handleSaveEdit}
          index={editingRecord.index}
        />
      )}

      {/* Add Record Modal using EditModal */}
      {showAddModal && entity && (
        <EditModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          record={{}}
          entity={entity}
          config={config}
          onSave={handleSaveRecord}
          index={-1}
          mode="add"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmation} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmation(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deletingIndex === deleteConfirmation?.index}
            >
              {deletingIndex === deleteConfirmation?.index ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 
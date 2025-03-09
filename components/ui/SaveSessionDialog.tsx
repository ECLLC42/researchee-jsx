// components/ui/SaveSessionDialog.tsx
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface SaveSessionDialogProps {
  onConfirm: () => void;
}

export function SaveSessionDialog({ onConfirm }: SaveSessionDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button 
          className="w-full h-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg 
                     border border-blue-500 flex items-center justify-center text-sm transition-all"
        >
          Save Session
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          asChild
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-1/2 left-1/2 w-80 max-w-full p-6 bg-gray-900 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2"
          >
            <Dialog.Title className="text-xl font-bold text-white">
              Confirm Save
            </Dialog.Title>
            <Dialog.Description className="text-gray-400 mt-2">
              Are you sure you want to save this session?
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Button onClick={() => onConfirm()}>Confirm</Button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
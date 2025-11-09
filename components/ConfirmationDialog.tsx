import React from 'react';
import { XIcon, ExclamationCircleIcon, SpinnerIcon } from './icons/Icons';

interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  isConfirming?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', isConfirming = false }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onCancel} aria-modal="true" role="dialog">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
        <div className="p-5 flex justify-between items-center border-b border-border-color">
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-surface-accent">
            <XIcon className="h-5 w-5 text-text-secondary" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="text-text-primary">{message}</p>
            </div>
          </div>
        </div>
        <div className="p-5 bg-surface-accent rounded-b-xl flex justify-end items-center space-x-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-text-primary bg-surface rounded-lg border border-border-color hover:bg-surface-accent/80 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isConfirming} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center w-28 disabled:opacity-50 disabled:cursor-not-allowed">
            {isConfirming ? <SpinnerIcon className="h-5 w-5" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
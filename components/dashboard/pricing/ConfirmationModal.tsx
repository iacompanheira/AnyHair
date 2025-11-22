import React from 'react';
import { AlertTriangleIcon } from '../Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm text-gray-800 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 id="confirmation-title" className="text-lg font-semibold mt-4">{title}</h3>
            <p className="text-gray-600 mt-2 text-sm">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Apagar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

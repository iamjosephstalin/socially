import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XIcon } from './icons/Icons';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
        handleClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [message]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); 
  }

  return (
    <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center w-full max-w-sm p-4 space-x-4 text-text-primary bg-surface border border-border-color rounded-xl shadow-md transition-all duration-300 z-50 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`} 
        role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
        <CheckCircleIcon className="w-5 h-5" />
      </div>
      <div className="text-sm font-medium">{message}</div>
      <button 
        type="button" 
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-accent transition-colors" 
        aria-label="Close"
        onClick={handleClose}
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
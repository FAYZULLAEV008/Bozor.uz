import React from 'react';
import { useNotification } from '../context/NotificationContext.tsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        let bgColor = 'bg-gray-900 text-white';
        let Icon = Info;

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bgColor = 'bg-rose-600 text-white shadow-lg shadow-rose-900/20';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl text-sm font-medium transition-all transform animate-in slide-in-from-top-2 duration-200 ${bgColor}`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

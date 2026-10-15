import React from 'react';
import type { ToastNotification } from '../types';
import { AlertTriangleIcon, CheckCircleIcon, CloseIcon, ShieldAlertIcon } from './Icons';
import './Toast.css';

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="jt-toast-container">
      {toasts.slice(0, 3).map((toast) => {
        const isDanger = toast.type === 'danger';
        const isSuccess = toast.type === 'success';

        return (
          <div key={toast.id} className={`jt-toast-card ${toast.type}`}>
            {/* Colored Left Accent Bar (Image #6) */}
            <div className="jt-toast-bar"></div>

            <div className="jt-toast-inner">
              <div className="jt-toast-icon-wrap">
                {isDanger ? (
                  <ShieldAlertIcon size={16} />
                ) : isSuccess ? (
                  <CheckCircleIcon size={16} />
                ) : (
                  <AlertTriangleIcon size={16} />
                )}
              </div>

              <div className="jt-toast-content">
                <div className="jt-toast-title">{toast.title}</div>
                <div className="jt-toast-message">{toast.message}</div>
                <div className="jt-toast-meta">{toast.timestamp}</div>
              </div>

              <button
                className="jt-toast-close-btn"
                onClick={() => onDismiss(toast.id)}
                title="Tutup Notifikasi"
              >
                <CloseIcon size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

import { useCallback, useMemo, useState } from 'react';
import { ToastContext } from './ToastContext.js';
import '../styles/toast.css';

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message, options = {}) => {
        const id = `${Date.now()}-${Math.random()}`;
        const toast = {
            id,
            message,
            type: options.type || 'info'
        };
        const duration = options.duration ?? 4000;

        setToasts((currentToasts) => [...currentToasts, toast]);

        if (duration > 0) {
            window.setTimeout(() => removeToast(id), duration);
        }

        return id;
    }, [removeToast]);

    const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-container" aria-live="polite" aria-atomic="true">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
                        <span>{toast.message}</span>
                        <button type="button" className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Cerrar notificación">
                            x
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

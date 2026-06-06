import { useCallback, useMemo, useState } from 'react';
import { ToastContext } from './ToastContext.js';
import '../styles/toast.css';

function ProveidorNotificacions({ children }) {
  const [toasts, setToasts] = useState([]);

  const eliminarNotificacio = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const mostrarNotificacio = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast = {
      id,
      message,
      type: options.type || 'info'
    };
    const duration = options.duration ?? 4000;

    setToasts((currentToasts) => [...currentToasts, toast]);

    if (duration > 0) {
      window.setTimeout(() => eliminarNotificacio(id), duration);
    }

    return id;
  }, [eliminarNotificacio]);

  const value = useMemo(() => ({ showToast: mostrarNotificacio, removeToast: eliminarNotificacio }), [mostrarNotificacio, eliminarNotificacio]);

  return (
    <ToastContext.Provider value={value}>
            {children}
            <div className="toast-container" aria-live="polite" aria-atomic="true">
                {toasts.map((toast) =>
        <div key={toast.id} className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
                        <span>{toast.message}</span>
                        <button type="button" className="toast-close" onClick={() => eliminarNotificacio(toast.id)} aria-label="Cerrar notificación">
                            x
                        </button>
                    </div>
        )}
            </div>
        </ToastContext.Provider>);

}export { ProveidorNotificacions };
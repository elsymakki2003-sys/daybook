import { useEffect } from 'react';

// Shows a short message, with an optional action (e.g. Undo), for 5 seconds.
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="toast" role="status">
      <span>{toast.message}</span>
      {toast.action && (
        <button
          className="toast-action"
          onClick={() => {
            toast.action.run();
            onClose();
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

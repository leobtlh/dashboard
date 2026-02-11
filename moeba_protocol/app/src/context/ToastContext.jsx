import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationToast from '../components/ui/NotificationToast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ message: '', type: 'info' });

    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });
        // Auto-dismiss après 4 secondes (comme dans app.html)
        setTimeout(() => {
            setToast((prev) => (prev.message === message ? { message: '', type: 'info' } : prev));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Le composant est rendu globalement ici */}
            <NotificationToast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: 'info' })}
            />
        </ToastContext.Provider>
    );
};

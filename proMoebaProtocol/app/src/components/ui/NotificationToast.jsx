import React from 'react';
import { AlertTriangle, CheckCircle2, X } from './Icons';

const NotificationToast = ({ message, type, onClose }) => {
    if (!message) return null;

    // Classes conditionnelles basées sur le type
    const bgClass = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-600' : 'bg-slate-800 dark:bg-slate-700';
    const icon = type === 'error' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />;

    return (
        <div className={`fixed bottom-6 right-6 z-[100] ${bgClass} text-white px-6 py-4 rounded-xl shadow-2xl animate-slide-up flex items-center gap-4 max-w-md`}>
            <div className="shrink-0">{icon}</div>
            <div className="flex-1 text-sm font-medium">{message}</div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export default NotificationToast;

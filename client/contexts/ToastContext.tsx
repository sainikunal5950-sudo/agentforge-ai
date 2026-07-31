"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const contextValue = React.useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const bgColors = {
        success: "bg-emerald-500/20 border-emerald-500/50 text-emerald-100",
        error: "bg-red-500/20 border-red-500/50 text-red-100",
        info: "bg-blue-500/20 border-blue-500/50 text-blue-100",
    };

    return (
        <div
            className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 min-w-[280px] max-w-sm ${bgColors[toast.type]}`}
            role="alert"
        >
            <p className="text-sm font-medium">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="ml-4 text-white/50 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
            >
                ✕
            </button>
        </div>
    );
}

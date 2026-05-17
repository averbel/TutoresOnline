"use client";

import React, { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

let toastId = 0;
const listeners: Array<(toast: ToastItem) => void> = [];

export function showToast(type: ToastType, message: string) {
  const toast: ToastItem = { id: ++toastId, type, message };
  listeners.forEach(fn => fn(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (toast: ToastItem) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 4000);
    };
    listeners.push(handler);
    return () => { const idx = listeners.indexOf(handler); if (idx >= 0) listeners.splice(idx, 1); };
  }, []);

  const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: '#ecfdf5', border: '#22c55e', icon: '✅' },
    error: { bg: '#fef2f2', border: '#ef4444', icon: '❌' },
    info: { bg: '#eff6ff', border: '#3b82f6', icon: 'ℹ️' },
  };

  return (
    <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {toasts.map(t => {
        const c = colors[t.type];
        return (
          <div key={t.id} style={{
            background: c.bg, border: `1px solid ${c.border}`, borderRadius: '0.5rem',
            padding: '0.8rem 1.2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <span>{c.icon}</span>
            <span style={{ fontWeight: 500 }}>{t.message}</span>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

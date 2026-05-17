"use client";

import React, { useEffect } from 'react';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data?.rol === 'TUTOR') {
          document.body.classList.add('theme-tutor');
        } else {
          document.body.classList.remove('theme-tutor');
        }
      })
      .catch(() => {});
  }, []);

  return <>{children}</>;
}

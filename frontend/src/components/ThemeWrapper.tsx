"use client";

import React, { useEffect } from 'react';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if the user is a Tutor to add .theme-tutor to the body
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.rol === 'TUTOR') {
          document.body.classList.add('theme-tutor');
        } else {
          document.body.classList.remove('theme-tutor');
        }
      } catch {
        // Ignorar si hay error de parceo
      }
    }
  }, []);

  return <>{children}</>;
}

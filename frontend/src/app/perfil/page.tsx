"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MiPerfil() {
  const [session, setSession] = useState<{ nombreCompleto: string; email: string; rol: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setSession(JSON.parse(savedUser));
    } else {
      window.location.href = '/login';
    }
  }, []);

  if (!session) return <div style={{ textAlign: 'center', padding: '4rem' }}>Cargando datos de seguridad...</div>;

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '4rem auto' }}>
      <div className="glass-card animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
            🎓
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{session.nombreCompleto}</h1>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>{session.email} &bull; Rol: {session.rol}</p>
          </div>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>Ajustes de Cuenta</h3>
        <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>
          La infraestructura de la base de datos está lista. La funcionalidad para sobre-escribir estos datos en Supabase (UPDATE) será asignada al próximo Sprint de desarrollo.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Link href="/" className="btn-secondary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
            Volver al Inicio
          </Link>
          <button className="btn-primary" style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }} disabled>
            Guardar Cambios
          </button>
        </div>
      </div>
    </main>
  );
}

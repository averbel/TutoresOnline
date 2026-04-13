"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ComoFunciona() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setSession(JSON.parse(savedUser));
  }, []);

  return (
    <div style={{ backgroundColor: 'hsl(var(--light-bg))', minHeight: '100vh' }}>
      <div className="container">
        <header className="header">
          <Link href={session ? "/inicio" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: 'hsl(var(--primary))', width: '35px', height: '35px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎓</div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Tutores<span className="text-primary">On-Line</span></span>
          </Link>

          <div className="header-links">
            <Link href={session ? "/inicio" : "/"} className="nav-link">Inicio</Link>
            <Link href="/buscar" className="nav-link">Buscar Tutores</Link>
            <Link href="/como-funciona" className="nav-link" style={{ color: 'hsl(var(--primary))', borderBottom: '2px solid hsl(var(--primary))', paddingBottom: '1.5rem', marginBottom: '-1.5rem' }}>Cómo Funciona</Link>
            <Link href="/registro-tutor" className="nav-link">Conviértete en Tutor</Link>
          </div>

          <div className="header-actions">
            {session ? (
              <Link href="/inicio" className="btn-secondary">Ir a Mi Panel</Link>
            ) : (
              <Link href="/" className="btn-primary">Iniciar Sesión</Link>
            )}
          </div>
        </header>

        <main style={{ padding: '4rem 0', maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center', color: 'hsl(var(--primary))' }}>
            El puente entre tu duda y el conocimiento.
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center', marginBottom: '4rem', lineHeight: '1.6' }}>
            TutoresOn-Line no es solo un directorio. Construimos un aula virtual privada donde la latencia desaparece y la educación fluye de manera interactiva.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid hsl(var(--border))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>🎯</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>1. Algoritmo de Emparejamiento</h3>
              </div>
              <p style={{ color: 'hsl(var(--foreground))', opacity: 0.8, lineHeight: '1.6' }}>
                Atrás quedaron las horas buscando un profesor en tablones de anuncios. Nuestra Inteligencia Artificial categoriza automáticamente tutores basándose en especialidades y reseñas validadas.
              </p>
            </div>

            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid hsl(var(--border))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                 <span style={{ fontSize: '2rem' }}>💳</span>
                 <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>2. Transacciones Cero Riesgo</h3>
              </div>
              <p style={{ color: 'hsl(var(--foreground))', opacity: 0.8, lineHeight: '1.6' }}>
                Retenemos el pago de forma segura usando Supabase Encrypted Tunnels. El maestro no recibe tus fondos hasta que no termina la hora académica prometida y calificas su sesión.
              </p>
            </div>

             <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid hsl(var(--border))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                 <span style={{ fontSize: '2rem' }}>💻</span>
                 <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>3. Pizarras Interactivas</h3>
              </div>
              <p style={{ color: 'hsl(var(--foreground))', opacity: 0.8, lineHeight: '1.6' }}>
                Olvídate de mandarse links de Google Meet. Toda tu enseñanza gráfica sucede directamente adentro de tu Dashboard, donde tienes el chat y la webcam en una sola pestaña.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

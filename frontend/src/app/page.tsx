"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    passwordHash: ''
  });
  const [status, setStatus] = useState<null | 'loading' | 'success' | 'error'>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch(`/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setStatus('success');
        localStorage.setItem('user', JSON.stringify(result.data));
        
        setTimeout(() => {
            window.location.href = '/inicio';
        }, 1000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const inputStyle = {
    padding: '0.9rem 1rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))',
    background: '#f8fafc', color: 'hsl(var(--foreground))', fontSize: '1rem', outline: 'none',
    transition: 'all 0.2s'
  };

  return (
    <main className="split-screen" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      
      {/* COMPONENTE VISUAL IZQUIERDO: Branding y Marketing */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', background: 'hsl(var(--primary))' }}>
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.35) sepia(0.2) hue-rotate(220deg)' }}></div>
         
         <div style={{ position: 'relative', zIndex: 10, color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', width: '50px', height: '50px', borderRadius: '12px', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🎓</div>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', textShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>Tutores<span style={{ color: '#c7d2fe' }}>On-Line</span></span>
            </div>
            
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', textShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
              Acelera tu <br/> aprendizaje real.
            </h1>
            <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '450px', lineHeight: 1.6, textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
              Miles de profesores y mentores calificados a nivel global te están esperando. Ingresa a la sala virtual del mañana.
            </p>
         </div>

         {/* Etiqueta Decorativa */}
         <div style={{ position: 'absolute', bottom: '3rem', left: '4rem', display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '1rem 1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
             <span style={{ fontSize: '1.5rem' }}>🛡️</span>
             <div>
                <div style={{ color: 'white', fontWeight: 'bold' }}>Plataforma Segura</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Supabase Encrypted</div>
             </div>
         </div>
      </div>

      {/* COMPONENTE DERECHO: El Formulario */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '2rem' }} className="animate-fade-in">
          
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
            Ingresa tus credenciales para acceder a tus tutorías y gestionar tus herramientas académicas.
          </p>

          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 2rem', background: '#ecfdf5', borderRadius: '1rem', border: '1px solid #a7f3d0' }} className="animate-fade-in">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#059669', fontWeight: 800 }}>🔓 Conectando al servidor...</h2>
              <p style={{ color: '#047857', fontWeight: 500 }}>Estamos abriendo las puertas de tu Dashboard académico.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Correo Electrónico</label>
                <input 
                  type="email" required style={inputStyle} placeholder="ejemplo@estudiante.com"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor = 'hsl(var(--primary))'}
                  onBlur={(e) => e.target.style.borderColor = 'hsl(var(--border))'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Tu Contraseña</label>
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 600 }}>¿La olvidaste?</span>
                </div>
                <input 
                  type="password" required style={inputStyle} placeholder="••••••••••••"
                  value={formData.passwordHash} onChange={(e) => setFormData({...formData, passwordHash: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor = 'hsl(var(--primary))'}
                  onBlur={(e) => e.target.style.borderColor = 'hsl(var(--border))'}
                />
              </div>

              {status === 'error' && (
                <div style={{ padding: '0.8rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.5rem', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>
                  ❌ Correo o contraseña no registrados en Supabase.
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '1rem', fontSize: '1.05rem', boxShadow: '0 4px 15px rgba(90, 79, 207, 0.3)' }} disabled={status === 'loading'}>
                {status === 'loading' ? 'Validando conexión cifrada...' : 'Ingresar a la Plataforma'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1rem' }}>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>¿Aún no tienes cuenta? </span>
                <Link href="/registro" style={{ color: 'hsl(var(--primary))', fontWeight: 700, textDecoration: 'none' }}>
                  Regístrate gratis
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

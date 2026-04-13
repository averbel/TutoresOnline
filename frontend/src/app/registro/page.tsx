"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Registro() {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    passwordHash: '',
    gradoAcademico: 'Universidad'
  });
  const [status, setStatus] = useState<null | 'loading' | 'success' | 'error'>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // Hacemos el puente (Fetch) desde nuestro cliente Next.js hacia el API Node.js/Express
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/usuarios/estudiantes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Error contactando al servidor Express:", error);
      setStatus('error');
    }
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    width: '100%',
  };

  const inputStyle = {
    padding: '0.8rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid hsl(var(--border))',
    background: 'rgba(0,0,0,0.2)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '4rem auto' }}>
      <div className="glass-card animate-fade-in">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }} className="text-gradient">
          Crea tu Cuenta
        </h1>
        <p style={{ color: 'hsl(var(--muted-foreground))', textAlign: 'center', marginBottom: '2rem' }}>
          Únete a la nueva generación de estudiantes
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem' }} className="animate-fade-in">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>¡Registro Exitoso!</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>
              Felicidades, tu cuenta ha viajado desde este Frontend, pasó por Node.js y acaba de guardarse en la nube de Supabase.
            </p>
            <Link href="/" className="btn-primary">Volver al Inicio</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={formStyle} className="animate-fade-in delay-100">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Nombre Completo</label>
              <input 
                type="text" 
                required 
                style={inputStyle}
                placeholder="Ej. Carlos Mendoza"
                value={formData.nombreCompleto}
                onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Correo Electrónico</label>
              <input 
                type="email" 
                required 
                style={inputStyle}
                placeholder="carlos@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Grado Académico</label>
                <select 
                  style={{...inputStyle, WebkitAppearance: 'none'}}
                  value={formData.gradoAcademico}
                  onChange={(e) => setFormData({...formData, gradoAcademico: e.target.value})}
                >
                  <option value="Primaria">Primaria</option>
                  <option value="Secundaria">Secundaria</option>
                  <option value="Universidad">Universidad</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Contraseña (Ficticia)</label>
                <input 
                  type="password" 
                  required 
                  style={inputStyle}
                  placeholder="********"
                  value={formData.passwordHash}
                  onChange={(e) => setFormData({...formData, passwordHash: e.target.value})}
                />
              </div>
            </div>

            {status === 'error' && (
              <p style={{ color: 'hsl(0, 100%, 70%)', fontSize: '0.9rem', textAlign: 'center' }}>
                Error al registrar. Verifica tener tu Backend ejecutándose (npm run dev desde backend).
              </p>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ marginTop: '1rem', width: '100%', opacity: status === 'loading' ? 0.7 : 1 }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Conectando Base de datos...' : 'Registrarme en la Plataforma'}
            </button>
            
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
              Al registrarte estás interactuando 100% con toda la arquitectura en la Nube.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

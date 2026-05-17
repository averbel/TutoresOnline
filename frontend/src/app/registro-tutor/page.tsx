"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type MateriaOption = { id: string; nombre: string; nivelEducativo: string };

export default function RegistroTutor() {
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [materias, setMaterias] = useState<MateriaOption[]>([]);
  const [formData, setFormData] = useState({
    nombreCompleto: '', email: '', password: '', experiencia: '', especialidad: '',
    materias: [] as { materiaId: string; tarifaPorHora: number }[]
  });
  const [status, setStatus] = useState<null | 'loading' | 'success' | 'error'>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setSession(data.data); })
      .catch(() => {});
    fetch('/api/materias')
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setMaterias(data.data); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch(`/api/usuarios/tutores_registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(result.message || 'Error desconocido.');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMsg('Fallo de conexión.');
    }
  };

  const inputStyle = {
    padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', 
    background: '#f8fafc', fontSize: '1rem', outline: 'none'
  };

  return (
    <div style={{ backgroundColor: 'hsl(var(--light-bg))', minHeight: '100vh' }}>
      <div className="container">
        
        {/* CABECERA REUTILIZADA */}
        <header className="header">
          <Link href={session ? "/inicio" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: 'hsl(var(--primary))', width: '35px', height: '35px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎓</div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>Tutores<span className="text-primary">On-Line</span></span>
          </Link>
          <div className="header-links">
            <Link href={session ? "/inicio" : "/"} className="nav-link">Inicio</Link>
            <Link href="/buscar" className="nav-link">Buscar Tutores</Link>
            <Link href="/como-funciona" className="nav-link">Cómo Funciona</Link>
            <Link href="/registro-tutor" className="nav-link" style={{ color: 'hsl(var(--primary))', borderBottom: '2px solid hsl(var(--primary))', paddingBottom: '1.5rem', marginBottom: '-1.5rem' }}>Conviértete en Tutor</Link>
          </div>
          <div className="header-actions">
            {session ? <Link href="/inicio" className="btn-secondary">Mi Panel</Link> : <Link href="/" className="btn-primary">Iniciar Sesión</Link>}
          </div>
        </header>

        {/* HERO DEL FORMULARIO DE REGISTRO */}
        <main style={{ padding: '4rem 0', display: 'flex', gap: '4rem', alignItems: 'flex-start' }} className="animate-fade-in split-screen">
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
              Monetiza tu <span className="text-primary">conocimiento</span>.
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>
              Únete al equipo élite de TutoresOn-Line, maneja tu propio horario y llega a miles de estudiantes a nivel internacional.
            </p>
            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '1rem', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}> Beneficios del programa: </div>
              <ul style={{ paddingLeft: '1.5rem', color: 'hsl(var(--foreground))', opacity: 0.8, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Ingreso a billetera directa los días 15 de cada mes.</li>
                <li>Pizarra virtual incluida para clases online.</li>
                <li>Sin membresías base. Solo cobramos un 5% de tarifa de interconexión.</li>
              </ul>
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: 'white', padding: '3rem', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Sube al estrado maestro</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>Completa tu expediente formativo.</p>

            {status === 'success' ? (
               <div style={{ textAlign: 'center', padding: '2rem', background: '#ecfdf5', borderRadius: '1rem' }}>
                  <span style={{ fontSize: '3rem' }}>🎉</span>
                  <h3 style={{ color: '#059669', fontSize: '1.5rem', fontWeight: 800, margin: '1rem 0' }}>¡Tutor Certificado!</h3>
                  <p style={{ color: '#10b981', marginBottom: '1.5rem' }}>Ya estás a bordo de la plataforma.</p>
                  <Link href="/" className="btn-primary">Ir a iniciar sesión</Link>
               </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Nombre Completo</label>
                      <input required style={inputStyle} value={formData.nombreCompleto} onChange={e=>setFormData({...formData, nombreCompleto: e.target.value})} placeholder="Ej. Ana Pérez"/>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Correo Profesional</label>
                      <input required type="email" style={inputStyle} value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="tutor@edu.com"/>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Años de Experiencia</label>
                    <input required type="number" min="0" max="50" style={inputStyle} value={formData.experiencia} onChange={e=>setFormData({...formData, experiencia: e.target.value})} placeholder="Ej. 5"/>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Especialidad Base</label>
                    <input required style={inputStyle} value={formData.especialidad} onChange={e=>setFormData({...formData, especialidad: e.target.value})} placeholder="Inglés, Física, etc."/>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Materias que impartes</label>
                  <select
                    style={inputStyle}
                    value=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const exists = formData.materias.find(m => m.materiaId === e.target.value);
                      if (!exists) {
                        setFormData({
                          ...formData,
                          materias: [...formData.materias, { materiaId: e.target.value, tarifaPorHora: 50 }]
                        });
                      }
                    }}
                  >
                    <option value="">Seleccionar materia...</option>
                    {materias.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre} ({m.nivelEducativo})</option>
                    ))}
                  </select>
                  {formData.materias.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {formData.materias.map((m, idx) => {
                        const mat = materias.find(x => x.id === m.materiaId);
                        return (
                          <div key={m.materiaId} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f3f0ff', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            <span style={{ flex: 1, fontWeight: 600 }}>{mat?.nombre || m.materiaId}</span>
                            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>S/</span>
                            <input
                              type="number" min="1" step="5"
                              style={{ width: '80px', padding: '0.3rem', borderRadius: '0.3rem', border: '1px solid hsl(var(--border))' }}
                              value={m.tarifaPorHora}
                              onChange={(e) => {
                                const newMaterias = [...formData.materias];
                                newMaterias[idx] = { ...newMaterias[idx], tarifaPorHora: parseInt(e.target.value) || 0 };
                                setFormData({ ...formData, materias: newMaterias });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, materias: formData.materias.filter((_, i) => i !== idx) })}
                              style={{ background: '#fee2e2', border: 'none', borderRadius: '0.3rem', padding: '0.2rem 0.5rem', cursor: 'pointer', color: '#ef4444' }}
                            >✕</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Crea tu Contraseña Maestra</label>
                  <input required type="password" style={inputStyle} value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})}/>
                </div>

                {status === 'error' && (
                  <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.8rem', borderRadius: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    {errorMsg}
                  </div>
                )}

                <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.05rem', background: 'hsl(var(--foreground))' }}>
                  {status === 'loading' ? 'Matriculando...' : 'Postular como Tutor Oficial'}
                </button>
              </form>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

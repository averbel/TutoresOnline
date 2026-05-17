"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, BookOpen, MapPin, Search, Video, Star, Calendar, MessageCircle, Shield, Globe, User, Zap } from 'lucide-react';

export default function Home() {
  type TutorData = {
    usuarioId: string;
    reputacionPromedio: number;
    activoAhoraFlash: boolean;
    biografia?: string;
    usuario: { nombreCompleto: string };
    materias: { materia: { nombre: string }, tarifaPorHora: number }[];
  };
  const [session, setSession] = useState<{ nombreCompleto: string; email: string; rol: string } | null>(null);
  const [tutores, setTutores] = useState<TutorData[]>([]);
  const [tutoresFlash, setTutoresFlash] = useState<TutorData[]>([]);
  const [materiaQuery, setMateriaQuery] = useState('');
  const [ubicacionQuery, setUbicacionQuery] = useState('');
  const [iaTema, setIaTema] = useState('');
  const [iaRespuesta, setIaRespuesta] = useState('');
  const [iaStatus, setIaStatus] = useState<null | 'loading' | 'error' | 'success'>(null);

  const solicitarResumenIA = async () => {
    if (!iaTema) return;
    setIaStatus('loading');
    setIaRespuesta('');
    try {
      const res = await fetch(`/api/ia`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo: 'resumen', mensaje: iaTema })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') { setIaRespuesta(data.data); setIaStatus('success'); }
      else { setIaRespuesta(data.message || 'Error del servidor IA'); setIaStatus('error'); }
    } catch { setIaRespuesta('Error de conexión con Lenux.'); setIaStatus('error'); }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.status === 'success' && data.data) setSession(data.data); else window.location.href = '/'; })
      .catch(() => { window.location.href = '/'; });

    fetch('/api/usuarios/tutores')
      .then(res => res.json())
      .then(data => { if (data.status === 'success' && Array.isArray(data.data)) { setTutores(data.data); setTutoresFlash(data.data.filter((t: TutorData) => t.activoAhoraFlash)); } else setTutores([]); })
      .catch(() => setTutores([]));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const getTutorImageStyle = (nombre: string) => {
    const bank = [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&q=80',
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=256&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&q=80',
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=256&q=80',
    ];
    let sum = 0; for (let i = 0; i < nombre.length; i++) sum += nombre.charCodeAt(i);
    return { backgroundImage: `url('${bank[sum % bank.length]}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
  };

  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < Math.round(rating) ? '#f59e0b' : '#d1d5db' }}>★</span>
  ));

  return (
    <div>
      <div className="container">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ backgroundColor: 'hsl(var(--primary))', width: '35px', height: '35px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={20} /></div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Tutores<span className="text-primary">On-Line</span></span>
          </div>
          <div className="header-links">
            <Link href="/" className="nav-link" style={{ color: 'hsl(var(--primary))', borderBottom: '2px solid hsl(var(--primary))', paddingBottom: '1.5rem', marginBottom: '-1.5rem' }}>Inicio</Link>
            <Link href="/buscar" className="nav-link">Buscar Tutores</Link>
            <Link href="/como-funciona" className="nav-link">Cómo Funciona</Link>
            <Link href="/registro-tutor" className="nav-link">Conviértete en Tutor</Link>
          </div>
          {session && (
            <div className="header-actions">
              <span style={{ fontSize: '0.95rem', color: 'hsl(var(--foreground))', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Globe size={16} /> ES <span style={{ fontSize: '0.7rem' }}>▼</span></span>
              <div style={{ width: '1px', height: '24px', background: 'hsl(var(--border))', margin: '0 0.8rem' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{session.nombreCompleto}</span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{session.email}</span>
                </div>
                <div>
                  <Link href="/perfil" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>Perfil</Link>
                  <button onClick={handleLogout} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#dc2626' }}>Cerrar</button>
                </div>
              </div>
            </div>
          )}
        </header>

        <section className="hero-section">
          <div>
            <h1 className="hero-title">Aprende con los mejores tutores, <br/> <span className="text-primary">cuando y donde quieras</span></h1>
            <p className="hero-subtitle">Conecta con tutores calificados en línea o presenciales. Reserva sesiones, mejora tus habilidades y alcanza tus metas académicas.</p>
            <div className="search-bar-container">
              <div className="search-field">
                <label><BookOpen size={16} className="text-blue-600" /> Materia</label>
                <input type="text" placeholder="¿Qué quieres aprender?" value={materiaQuery} onChange={(e) => setMateriaQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = `/buscar?q=${encodeURIComponent(materiaQuery)}`; }} />
              </div>
              <div className="search-field">
                <label><GraduationCap size={16} className="text-blue-600" /> Nivel</label>
                <select><option>Todos los niveles</option></select>
              </div>
              <div className="search-field" style={{ flex: 0.8 }}>
                <label><MapPin size={16} className="text-blue-600" /> Ubicación</label>
                <input type="text" placeholder="Ej. Perú, México..." value={ubicacionQuery} onChange={(e) => setUbicacionQuery(e.target.value)} />
              </div>
              <div style={{ padding: '0.5rem' }}>
                <button onClick={() => window.location.href = `/buscar?q=${encodeURIComponent(materiaQuery)}&loc=${encodeURIComponent(ubicacionQuery)}`}
                  className="btn-primary" style={{ padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Search size={20} /> Buscar</button>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center' }}>
              <User size={16} className="text-green-500 mr-2" />
              <span style={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginRight: '0.3rem' }}>{tutores.length > 0 ? tutores.length : '1,200'}</span> tutores disponibles
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100%', height: '500px', backgroundColor: '#e2e8f0', borderRadius: '1.5rem', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'url("https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80") center/cover' }}></div>
            </div>
            <div style={{ position: 'absolute', top: '3rem', left: '-2.5rem', background: 'white', padding: '0.8rem 1.2rem', borderRadius: '0.8rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ color: 'hsl(var(--primary))' }}><Video size={32} /></div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.2 }}>Clases Virtuales y Presenciales</div>
            </div>
            <div style={{ position: 'absolute', top: '4rem', right: '-1.5rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '0.8rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.3rem' }}>
                <Star size={24} className="text-yellow-400 fill-current" /> 4.9
              </div>
              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Calificación promedio</div>
            </div>
          </div>
        </section>
      </div>

      {tutoresFlash.length > 0 && (
        <div className="container" style={{ padding: '0 2rem 3rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', borderRadius: '1.5rem', padding: '2rem 3rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Zap size={32} style={{ color: '#fbbf24' }} />
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Tutores Disponibles Ahora</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {tutoresFlash.slice(0, 5).map(t => (
                <Link key={t.usuarioId} href={`/buscar?q=${encodeURIComponent(t.materias[0]?.materia?.nombre || '')}`}
                  style={{ textDecoration: 'none', color: 'inherit', minWidth: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', ...getTutorImageStyle(t.usuario.nombreCompleto), flexShrink: 0 }}></div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.usuario.nombreCompleto}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{t.materias[0]?.materia?.nombre || 'General'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>{renderStars(t.reputacionPromedio)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ padding: '2rem 2rem 4rem' }}>
        <div style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #4338ca 100%)', borderRadius: '1.5rem', padding: '3rem', color: 'white', display: 'flex', gap: '3rem', alignItems: 'center', boxShadow: '0 20px 40px rgba(67, 56, 202, 0.2)' }} className="split-screen">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <MessageCircle size={32} />
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Lenux</h2>
            </div>
            <p style={{ opacity: 0.9, fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>Acelera tu aprendizaje. Pídele a Lenux que te genere un resumen instantáneo sobre cualquier tema.</p>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '0.8rem' }}>
              <input type="text" placeholder="Ej. Termodinámica, React Hooks..." value={iaTema} onChange={(e) => setIaTema(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', padding: '0.5rem 1rem', width: '100%', fontSize: '1.05rem' }} />
              <button onClick={solicitarResumenIA} disabled={iaStatus==='loading'} style={{ background: 'white', color: 'hsl(var(--primary))', border: 'none', borderRadius: '0.5rem', padding: '0.8rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
                {iaStatus === 'loading' ? 'Procesando...' : 'Generar ⚡'}
              </button>
            </div>
          </div>
          <div style={{ flex: 1.2, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: iaRespuesta ? 'flex-start' : 'center', alignItems: iaRespuesta ? 'flex-start' : 'center' }}>
            {!iaRespuesta && iaStatus !== 'loading' && <span style={{ opacity: 0.5 }}>Tu resumen aparecerá aquí...</span>}
            {iaStatus === 'loading' && <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#a5b4fc', fontWeight: 'bold' }}><div style={{ width: '20px', height: '20px', border: '3px solid #a5b4fc', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Lenux está pensando...</div>}
            {iaRespuesta && <div style={{ lineHeight: 1.7, fontSize: '1.05rem', color: iaStatus==='error'?'#fca5a5':'white', whiteSpace: 'pre-wrap' }}>{iaRespuesta}</div>}
          </div>
        </div>
      </div>

      <div className="section-light">
        <div className="container features-grid">
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2.5rem' }}>¿Por qué elegir <span className="text-primary">TutoresOn-Line</span>?</h2>
            <div className="benefits-grid">
              {[{ icon: <GraduationCap size={32} />, title: 'Tutores Calificados', desc: 'Profesionales verificados' },
                { icon: <Calendar size={32} />, title: 'Reserva Fácil', desc: 'Agenda en tiempo real' },
                { icon: <Video size={32} />, title: 'Videollamadas', desc: 'Clases con un clic' },
                { icon: <Shield size={32} />, title: 'Pago Seguro', desc: 'Información protegida' },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-text">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2.5rem' }}>¿Cómo funciona?</h2>
            {[{ n: '1', t: 'Regístrate', d: 'Crea tu cuenta como estudiante' }, { n: '2', t: 'Busca y Elige', d: 'Encuentra el tutor perfecto' }, { n: '3', t: 'Reserva y Aprende', d: 'Agenda y comienza a aprender' }].map((s, i) => (
              <div key={i} className="step-row">
                <div className="step-number">{s.n}</div>
                <div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.t}</div><div style={{ color: 'hsl(var(--muted-foreground))' }}>{s.d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '5rem 2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Tutores Destacados</h2>
        <div className="tutors-grid">
          {tutores.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="tutor-card" style={{ opacity: 0.5 }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '0.5rem', background: '#e2e8f0' }}></div>
                <div style={{ flex: 1 }}><div style={{ height: '1rem', width: '60%', background: '#e2e8f0', borderRadius: '0.3rem', marginBottom: '0.5rem' }}></div><div style={{ height: '0.8rem', width: '40%', background: '#e2e8f0', borderRadius: '0.3rem' }}></div></div>
              </div>
            ))
          ) : tutores.slice(0, 6).map(t => {
            const materiaPrinc = t.materias[0];
            return (
              <Link key={t.usuarioId} href={`/buscar?q=${encodeURIComponent(materiaPrinc?.materia?.nombre || '')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="tutor-card">
                  <div className="tutor-image" style={{ width: '90px', height: '90px', borderRadius: '0.5rem', ...getTutorImageStyle(t.usuario.nombreCompleto) }}></div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{t.usuario.nombreCompleto}</span>
                        {t.activoAhoraFlash && <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 700 }}>Flash</span>}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, margin: '0.3rem 0' }}>{materiaPrinc?.materia?.nombre || 'General'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                        {renderStars(t.reputacionPromedio)}
                        <span style={{ fontWeight: 700, marginLeft: '0.3rem' }}>{t.reputacionPromedio.toFixed(1)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Virtual / Presencial</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>S/ {materiaPrinc?.tarifaPorHora || 50}</span>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bottom-banner">
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', color: 'hsl(var(--primary))' }}>¿Eres tutor? Únete a nuestra plataforma</h2>
            <p style={{ color: 'hsl(var(--foreground))', fontSize: '1.05rem' }}>Comparte tu conocimiento y genera ingresos.</p>
          </div>
          <Link href="/registro-tutor" className="btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}>Conviértete en Tutor</Link>
        </div>
      </div>
    </div>
  );
}

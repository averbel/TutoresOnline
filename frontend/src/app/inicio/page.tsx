"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  type TutorData = {
    usuarioId: string;
    reputacionPromedio: number;
    usuario: { nombreCompleto: string };
    materias: { materia: { nombre: string }, tarifaPorHora: number }[];
  };
  const [session, setSession] = useState<{ nombreCompleto: string; email: string; rol: string } | null>(null);
  const [tutores, setTutores] = useState<TutorData[]>([]);
  const [materiaQuery, setMateriaQuery] = useState('');
  const [ubicacionQuery, setUbicacionQuery] = useState('');
  
  // Estados de la IA
  const [iaTema, setIaTema] = useState('');
  const [iaRespuesta, setIaRespuesta] = useState('');
  const [iaStatus, setIaStatus] = useState<null | 'loading' | 'error' | 'success'>(null);

  const solicitarResumenIA = async () => {
    if (!iaTema) return;
    setIaStatus('loading');
    setIaRespuesta('');
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiHost}/api/ia/generar-resumen`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: iaTema })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setIaRespuesta(data.data);
        setIaStatus('success');
      } else {
        setIaRespuesta(data.message || 'Error del servidor IA');
        setIaStatus('error');
      }
    } catch {
      setIaRespuesta('Error de conexión con el Copiloto.');
      setIaStatus('error');
    }
  };

  useEffect(() => {
    // 1. Carga de sesión
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession(JSON.parse(savedUser));
    } else {
      window.location.href = '/';
    }

    // 2. Tutors Load (Llenando dinámicamente desde el backend)
    const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiHost}/api/usuarios/tutores`)
      .then(res => res.json())
      .then(data => setTutores(data))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirigir de inmediato al root
  };

  const getTutorImageStyle = (nombre: string) => {
    if (nombre.includes('Carlos')) return { backgroundImage: "url('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' };
    if (nombre.includes('Ana')) return { backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' };
    if (nombre.includes('Luis')) return { backgroundImage: "url('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' };

    const bank = [
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=256&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&q=80',
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=256&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&q=80',
      'https://images.unsplash.com/photo-1504257432389-523431e15ce5?w=256&q=80'
    ];
    let sum = 0; for(let i=0; i<nombre.length; i++) sum += nombre.charCodeAt(i);
    const url = bank[sum % bank.length];

    return { backgroundImage: `url('${url}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
  };

  return (
    <div>
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <div className="container">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ backgroundColor: 'hsl(var(--primary))', width: '35px', height: '35px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎓</div>
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
              <span style={{ fontSize: '0.95rem', color: 'hsl(var(--foreground))', fontWeight: 500 }}>🌐 ES <span style={{ fontSize: '0.7rem' }}>▼</span></span>
              <div style={{ width: '1px', height: '24px', background: 'hsl(var(--border))', margin: '0 0.8rem' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{session.nombreCompleto}</span>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{session.email}</span>
                  </div>
                  <div>
                    <Link href="/perfil" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}>Editar</Link>
                    <button onClick={handleLogout} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#dc2626' }}>Cerrar</button>
                  </div>
              </div>
            </div>
          )}
        </header>

        {/* SECCIÓN PRINCIPAL */}
        <section className="hero-section">
          <div>
            <h1 className="hero-title">
              Aprende con los mejores tutores, <br/> <span className="text-primary">cuando y donde quieras</span>
            </h1>
            <p className="hero-subtitle">
              Conecta con tutores calificados en línea o presenciales. Reserva sesiones, mejora tus habilidades y alcanza tus metas académicas.
            </p>

            <div className="search-bar-container">
              <div className="search-field">
                <label>📖 Materia</label>
                <input 
                  type="text" 
                  placeholder="¿Qué quieres aprender?" 
                  value={materiaQuery}
                  onChange={(e) => setMateriaQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = `/buscar?q=${encodeURIComponent(materiaQuery)}&loc=${encodeURIComponent(ubicacionQuery)}`; }}
                />
              </div>
              <div className="search-field">
                <label>🎓 Nivel</label>
                <select><option>Todos los niveles</option></select>
              </div>
              <div className="search-field" style={{ flex: 0.8 }}>
                <label>📍 Ubicación</label>
                <input 
                  type="text" 
                  placeholder="Ej. Perú, México..." 
                  value={ubicacionQuery}
                  onChange={(e) => setUbicacionQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = `/buscar?q=${encodeURIComponent(materiaQuery)}&loc=${encodeURIComponent(ubicacionQuery)}`; }}
                />
              </div>
              <div style={{ padding: '0.5rem' }}>
                <button 
                  className="btn-primary" 
                  style={{ padding: '0.9rem 1.5rem', width: '100%', fontSize: '1rem' }}
                  onClick={() => window.location.href = `/buscar?q=${encodeURIComponent(materiaQuery)}&loc=${encodeURIComponent(ubicacionQuery)}`}
                >
                  🔍 Buscar Tutores
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
              <span style={{ color: '#22c55e', fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '0.2rem' }}>●</span> 
              <span style={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}>Más de 1,200</span> tutores disponibles • Clases virtuales y presenciales
            </div>
          </div>
          
          <div style={{ position: 'relative' }}>
             {/* Imagen Principal con Marcador estético */}
             <div style={{ width: '100%', height: '500px', backgroundColor: '#e2e8f0', borderRadius: '1.5rem', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: '100%', height: '100%', background: 'url("https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80") center/cover' }}></div>
             </div>
             
             {/* Insignias Flotantes */}
             <div style={{ position: 'absolute', top: '3rem', left: '-2.5rem', background: 'white', padding: '0.8rem 1.2rem', borderRadius: '0.8rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <div style={{ color: 'hsl(var(--primary))', fontSize: '1.5rem' }}>💻</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.2 }}>Clases<br/>Virtuales<br/><span style={{fontWeight: 'normal', color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem'}}>y Presenciales</span></div>
             </div>

             <div style={{ position: 'absolute', top: '4rem', right: '-1.5rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '0.8rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.3rem' }}>
                   <span style={{ color: '#fbbf24' }}>⭐</span> 4.9
                </div>
                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.2, marginTop: '0.3rem' }}>Calificación promedio<br/>de tutores</div>
             </div>

             <div style={{ position: 'absolute', bottom: '3rem', right: '-1rem', background: 'white', padding: '0.8rem 1.2rem', borderRadius: '0.8rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5rem' }}>📅</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.2 }}>Reserva<br/>Inmediata</div>
             </div>
          </div>
        </section>
      </div>

      {/* CEREBRO IA COPILOTO */}
      <div className="container" style={{ padding: '2rem 2rem 4rem' }}>
        <div style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #4338ca 100%)', borderRadius: '1.5rem', padding: '3rem', color: 'white', display: 'flex', gap: '3rem', alignItems: 'center', boxShadow: '0 20px 40px rgba(67, 56, 202, 0.2)' }} className="split-screen">
           <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>🧠</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Copiloto IA</h2>
              </div>
              <p style={{ opacity: 0.9, fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Acelera tu aprendizaje. Pídele al asistente basado en Gemini que te genere un resumen instantáneo sobre cualquier tema o fórmula.
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '0.8rem' }}>
                 <input 
                   type="text" placeholder="Ej. Termodinámica, React Hooks..." 
                   value={iaTema} onChange={(e) => setIaTema(e.target.value)}
                   style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', padding: '0.5rem 1rem', width: '100%', fontSize: '1.05rem' }}
                 />
                 <button onClick={solicitarResumenIA} disabled={iaStatus==='loading'} style={{ background: 'white', color: 'hsl(var(--primary))', border: 'none', borderRadius: '0.5rem', padding: '0.8rem 1.5rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s', opacity: iaStatus==='loading'?0.7:1 }}>
                   {iaStatus === 'loading' ? 'Procesando...' : 'Generar ⚡'}
                 </button>
              </div>
           </div>

           <div style={{ flex: 1.2, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: iaRespuesta ? 'flex-start' : 'center', alignItems: iaRespuesta ? 'flex-start' : 'center' }}>
              {!iaRespuesta && iaStatus !== 'loading' && (
                 <span style={{ opacity: 0.5 }}>Tu resumen aparecerá aquí...</span>
              )}
              {iaStatus === 'loading' && (
                 <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#a5b4fc', fontWeight: 'bold' }}>
                   <div style={{ width: '20px', height: '20px', border: '3px solid #a5b4fc', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                   Sintetizando información biométrica...
                 </div>
              )}
              {iaRespuesta && (
                 <div className="animate-fade-in" style={{ lineHeight: 1.7, fontSize: '1.05rem', color: iaStatus==='error'?'#fca5a5':'white', whiteSpace: 'pre-wrap' }}>
                    {iaRespuesta}
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* SECCIÓN GRIS: POR QUÉ ELEGIR / CÓMO FUNCIONA */}
      <div className="section-light">
        <div className="container features-grid">
           <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2.5rem' }}>¿Por qué elegir <span className="text-primary">TutoresOn-Line</span>?</h2>
              <div className="benefits-grid">
                 <div className="feature-card">
                    <div className="feature-icon">👩‍🏫</div>
                    <div className="feature-title">Tutores Calificados</div>
                    <div className="feature-text">Profesionales verificados y calificados</div>
                 </div>
                 <div className="feature-card">
                    <div className="feature-icon">📅</div>
                    <div className="feature-title">Reserva Fácil y Rápida</div>
                    <div className="feature-text">Agenda en tiempo real, como Uber</div>
                 </div>
                 <div className="feature-card">
                    <div className="feature-icon">💻</div>
                    <div className="feature-title">Videollamadas Integradas</div>
                    <div className="feature-text">Clases virtuales con un clic</div>
                 </div>
                 <div className="feature-card">
                    <div className="feature-icon">🛡️</div>
                    <div className="feature-title">Pago Seguro</div>
                    <div className="feature-text">Tu información y pagos protegidos</div>
                 </div>
              </div>
           </div>
           
           <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2.5rem' }}>¿Cómo funciona?</h2>
              
              <div className="step-row">
                 <div className="step-number">1</div>
                 <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Regístrate</div>
                    <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1rem' }}>Crea tu cuenta como estudiante</div>
                 </div>
              </div>
              <div className="step-row">
                 <div className="step-number">2</div>
                 <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Busca y Elige</div>
                    <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1rem' }}>Encuentra el tutor perfecto para ti</div>
                 </div>
              </div>
              <div className="step-row">
                 <div className="step-number">3</div>
                 <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Reserva y Aprende</div>
                    <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1rem' }}>Agenda tu sesión y comienza a aprender</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* SECCIÓN: TUTORES DESTACADOS (Consumidos desde BD PostgreSQL) */}
      <div className="container" style={{ padding: '5rem 2rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Tutores Destacados</h2>
            <Link href="#" className="text-primary" style={{ fontWeight: 600, textDecoration: 'none', fontSize: '1.1rem' }}>Ver todos los tutores →</Link>
         </div>

         <div className="tutors-grid">
            {tutores.length === 0 ? (
               <p style={{ color: 'hsl(var(--muted-foreground))' }}>Conectando a Supabase para cargar tutores reales...</p>
            ) : tutores.map((t) => {
               const materiaPrinc = t.materias[0];
               // Simulamos cantidad de clases para demostración
               const classNum = t.usuario.nombreCompleto.includes('Carlos') ? 124 : t.usuario.nombreCompleto.includes('Ana') ? 89 : 45;
               
               return (
                  <div key={t.usuarioId} className="tutor-card">
                     <div className="tutor-image" style={getTutorImageStyle(t.usuario.nombreCompleto)}></div>
                     
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{t.usuario.nombreCompleto}</span>
                              <span style={{ background: '#f3f0ff', color: 'hsl(var(--primary))', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 700 }}>
                                 {t.usuario.nombreCompleto.includes('Luis') ? 'Nuevo' : 'Tutor Pro'}
                              </span>
                           </div>
                           <div style={{ fontSize: '0.9rem', color: 'hsl(var(--foreground))', margin: '0.3rem 0 0.5rem', fontWeight: 500 }}>
                              {materiaPrinc?.materia?.nombre || 'General'}
                           </div>
                           
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                              <span style={{ color: '#fbbf24' }}>⭐</span> 
                              <span style={{ fontWeight: 700 }}>{t.reputacionPromedio}</span> 
                              <span style={{ color: 'hsl(var(--muted-foreground))' }}>( {classNum} clases )</span>
                           </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                           <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <span style={{ fontSize: '1.1rem' }}>{t.usuario.nombreCompleto.includes('Ana') ? '💻' : '📍'}</span>
                              {t.usuario.nombreCompleto.includes('Ana') ? 'Virtual' : `A ${t.usuario.nombreCompleto.includes('Carlos') ? 2 : 5} km`}
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'hsl(var(--foreground))' }}>S/ {materiaPrinc?.tarifaPorHora || '50'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>por hora</div>
                           </div>
                        </div>
                     </div>
                  </div>
               )
            })}
         </div>

         {/* BANNER INFERIOR */}
         <div className="bottom-banner">
            <div>
               <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', color: 'hsl(var(--primary))' }}>¿Eres tutor? Únete a nuestra plataforma</h2>
               <p style={{ color: 'hsl(var(--foreground))', fontSize: '1.05rem' }}>Comparte tu conocimiento y genera ingresos ayudando a otros a aprender.</p>
            </div>
            <button className="btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem', background: 'hsl(var(--primary))' }}>Conviértete en Tutor</button>
         </div>
      </div>
    </div>
  );
}

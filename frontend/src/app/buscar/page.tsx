"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BuscarTutores() {
  type TutorData = {
    usuarioId: string;
    reputacionPromedio: number;
    biografia?: string;
    usuario: { nombreCompleto: string };
    materias: { materia: { nombre: string }, tarifaPorHora: number }[];
  };
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [tutores, setTutores] = useState<TutorData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ubicacionTerm, setUbicacionTerm] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedUser) setSession(JSON.parse(savedUser));

    // Captura la consulta de búsqueda si se redirigió desde la sección Hero
    if (typeof window !== 'undefined') {
       const urlParams = new URLSearchParams(window.location.search);
       const q = urlParams.get('q');
       const loc = urlParams.get('loc');
       if (q) setSearchTerm(q);
       if (loc) setUbicacionTerm(loc);
    }

    fetch(`/api/usuarios/tutores`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTutores(data);
        } else {
          console.error("API Error: data is not an array", data);
          setTutores([]);
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setTutores([]);
      });
  }, []);

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

   const filteredTutores = Array.isArray(tutores) ? tutores.filter(t => {
      let pais = 'Virtual';
      try { if(t.biografia) pais = JSON.parse(t.biografia).paisOrigen || 'Virtual'; } catch {}

      const matchQuery = t.usuario.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (t.materias[0]?.materia?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchLoc = !ubicacionTerm || pais.toLowerCase().includes(ubicacionTerm.toLowerCase());
      
      return matchQuery && matchLoc;
   }) : [];

  return (
    <div style={{ backgroundColor: 'hsl(var(--light-bg))', minHeight: '100vh', paddingBottom: '5rem' }}>
      <div className="container">
        
        {/* CABECERA REUTILIZADA */}
        <header className="header">
          <Link href={session ? "/inicio" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: 'hsl(var(--primary))', width: '35px', height: '35px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎓</div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>Tutores<span className="text-primary">On-Line</span></span>
          </Link>
          <div className="header-links">
            <Link href={session ? "/inicio" : "/"} className="nav-link">Inicio</Link>
            <Link href="/buscar" className="nav-link" style={{ color: 'hsl(var(--primary))', borderBottom: '2px solid hsl(var(--primary))', paddingBottom: '1.5rem', marginBottom: '-1.5rem' }}>Buscar Tutores</Link>
            <Link href="/como-funciona" className="nav-link">Cómo Funciona</Link>
            <Link href="/registro-tutor" className="nav-link">Conviértete en Tutor</Link>
          </div>
          <div className="header-actions">
            {session ? <Link href="/inicio" className="btn-secondary">Mi Panel</Link> : <Link href="/" className="btn-primary">Iniciar Sesión</Link>}
          </div>
        </header>

        <main style={{ marginTop: '3rem' }}>
          
          <div style={{ background: 'hsl(var(--primary))', padding: '3rem', borderRadius: '1.5rem', color: 'white', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
               <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Encuentra a tu tutor ideal</h1>
               <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Filtra a miles de profesionales y agenda al instante.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', background: 'white', padding: '0.5rem', borderRadius: '0.8rem', width: '100%', maxWidth: '600px' }}>
               <div style={{ display: 'flex', alignItems: 'center', flex: 1, borderRight: '1px solid hsl(var(--border))', paddingRight: '0.5rem' }}>
                 <span style={{ padding: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>🔍</span>
                 <input 
                   type="text" placeholder="Materia o nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', color: 'hsl(var(--foreground))' }}
                 />
               </div>
               <div style={{ display: 'flex', alignItems: 'center', flex: 0.6 }}>
                 <span style={{ padding: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>📍</span>
                 <input 
                   type="text" placeholder="País (Ej. Perú)" value={ubicacionTerm} onChange={e => setUbicacionTerm(e.target.value)}
                   style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', color: 'hsl(var(--foreground))' }}
                 />
               </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {filteredTutores.length === 0 ? (
               <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.1rem' }}>{tutores.length === 0 ? "Descargando tutores..." : "No se encontró ningún tutor con ese perfil."}</p>
            ) : filteredTutores.map(t => {
               const materiaPrinc = t.materias[0];
               
               return (
                  <div key={t.usuarioId} style={{ background: 'white', borderRadius: '1rem', border: '1px solid hsl(var(--border))', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition: 'transform 0.2s', cursor: 'pointer' }} className="animate-fade-in">
                     <div style={{ width: '100%', height: '220px', ...getTutorImageStyle(t.usuario.nombreCompleto) }}></div>
                     <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                           <div>
                              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{t.usuario.nombreCompleto}</h3>
                              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>📍 {(() => { try { return JSON.parse(t.biografia || '{}').paisOrigen || 'Latinoamérica' } catch { return 'Virtual' }})()}</span>
                           </div>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700, fontSize: '0.9rem' }}>
                              <span style={{ color: '#fbbf24' }}>⭐</span> {t.reputacionPromedio}
                           </span>
                        </div>
                        <div style={{ color: 'hsl(var(--primary))', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' }}>
                           {materiaPrinc?.materia?.nombre || 'Especialista General'}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem' }}>
                           <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
                              Virtual / Presencial
                           </div>
                           <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'hsl(var(--foreground))' }}>
                              S/ {materiaPrinc?.tarifaPorHora || '50'}<span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>/hr</span>
                           </div>
                        </div>
                     </div>
                  </div>
               )
            })}
          </div>

        </main>
      </div>
    </div>
  );
}

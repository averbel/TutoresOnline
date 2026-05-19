"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, Search, MapPin, Star, Calendar, X, Navigation, Zap } from 'lucide-react';

type TutorData = {
  usuarioId: string;
  reputacionPromedio: number;
  biografia?: string;
  activoAhoraFlash: boolean;
  latitud?: number;
  longitud?: number;
  usuario: { nombreCompleto: string; email: string };
  materias: { materia: { id: string; nombre: string; nivelEducativo: string }, tarifaPorHora: number }[];
  disponibilidades: { id: string; diaSemana: number; horaInicio: string; horaFin: string }[];
};

type MateriaOption = { id: string; nombre: string; nivelEducativo: string };

type SessionData = { id: string; nombreCompleto: string; email: string; rol: string };

export default function BuscarTutores() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [tutores, setTutores] = useState<TutorData[]>([]);
  const [materias, setMaterias] = useState<MateriaOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroRepMin, setFiltroRepMin] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [filtroDia, setFiltroDia] = useState('');
  const [filtroHora, setFiltroHora] = useState('');
  const [loading, setLoading] = useState(true);

  const defaultFecha = (() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();
  const [bookingTutor, setBookingTutor] = useState<TutorData | null>(null);
  const [bookingMateriaId, setBookingMateriaId] = useState('');
  const [bookingFecha, setBookingFecha] = useState('');
  const [bookingHoraInicio, setBookingHoraInicio] = useState('10:00');
  const [bookingDuracion, setBookingDuracion] = useState('60');
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [bookingMsg, setBookingMsg] = useState('');

  const [flashBookingStatus, setFlashBookingStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'success' | 'error' }>({});
  const [flashBookingMsg, setFlashBookingMsg] = useState('');

  const cargarTutores = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('materia', searchTerm);
    if (filtroMateria) params.set('materia', filtroMateria);
    if (filtroNivel) params.set('nivel', filtroNivel);
    if (filtroRepMin) params.set('reputacionMin', filtroRepMin);
    if (filtroDia) params.set('diaSemana', filtroDia);
    if (filtroHora) params.set('hora', filtroHora);

    fetch(`/api/usuarios/tutores?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setTutores(data.data || []);
        else setTutores([]);
      })
      .catch(() => setTutores([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setSession(data.data); })
      .catch(() => {});

    fetch('/api/materias')
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setMaterias(data.data); })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q');
      if (q) setSearchTerm(q);
    }

    cargarTutores();
  }, []);

  useEffect(() => { cargarTutores(); }, [filtroMateria, filtroNivel, filtroRepMin, filtroDia, filtroHora]);

  const usarMiUbicacion = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFiltroUbicacion(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          const params = new URLSearchParams();
          if (searchTerm) params.set('materia', searchTerm);
          if (filtroMateria) params.set('materia', filtroMateria);
          if (filtroNivel) params.set('nivel', filtroNivel);
          if (filtroRepMin) params.set('reputacionMin', filtroRepMin);
          if (filtroDia) params.set('diaSemana', filtroDia);
          if (filtroHora) params.set('hora', filtroHora);
          params.set('lat', pos.coords.latitude.toString());
          params.set('lng', pos.coords.longitude.toString());
          params.set('distanciaMax', '50');

          setLoading(true);
          fetch(`/api/usuarios/tutores?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
              if (data.status === 'success') setTutores(data.data || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        },
        () => { alert('No se pudo obtener tu ubicación. Activa el GPS.'); }
      );
    } else {
      alert('Geolocalización no soportada en este navegador.');
    }
  };

  const handleBooking = async () => {
    if (!session || !bookingTutor || !bookingMateriaId || !bookingFecha || !bookingHoraInicio) {
      setBookingMsg('Completa todos los campos');
      return;
    }
    setBookingStatus('loading');
    const inicio = new Date(`${bookingFecha}T${bookingHoraInicio}`);
    const fin = new Date(inicio.getTime() + parseInt(bookingDuracion) * 60000);

    try {
      const res = await fetch('/api/tutorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: bookingTutor.usuarioId,
          materiaId: bookingMateriaId,
          fechaInicio: inicio.toISOString(),
          fechaFin: fin.toISOString(),
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setBookingStatus('success');
        setBookingMsg('¡Solicitud enviada! El tutor confirmará la tutoría.');
      } else {
        setBookingStatus('error');
        setBookingMsg(data.message || 'Error al reservar');
      }
    } catch {
      setBookingStatus('error');
      setBookingMsg('Error de conexión');
    }
  };

  const handleFlashBooking = async (tutorId: string, materiaId: string) => {
    setFlashBookingStatus(prev => ({ ...prev, [tutorId]: 'loading' }));
    setFlashBookingMsg('');
    try {
      const res = await fetch('/api/tutorias/flash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId, materiaId })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setFlashBookingStatus(prev => ({ ...prev, [tutorId]: 'success' }));
        setFlashBookingMsg('¡Tutoría iniciada! Ve a tu panel para unirte.');
        setTimeout(() => setFlashBookingMsg(''), 5000);
      } else {
        setFlashBookingStatus(prev => ({ ...prev, [tutorId]: 'error' }));
        setFlashBookingMsg(data.message || 'Error');
        setTimeout(() => setFlashBookingMsg(''), 5000);
      }
    } catch {
      setFlashBookingStatus(prev => ({ ...prev, [tutorId]: 'error' }));
      setFlashBookingMsg('Error de conexión');
      setTimeout(() => setFlashBookingMsg(''), 5000);
    }
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#f59e0b' : '#d1d5db', fontSize: '1rem' }}>★</span>
    ));
  };

  const diasSemanaOpts = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Lunes' },
    { value: '2', label: 'Martes' },
    { value: '3', label: 'Miércoles' },
    { value: '4', label: 'Jueves' },
    { value: '5', label: 'Viernes' },
    { value: '6', label: 'Sábado' },
  ];

  return (
    <div style={{ backgroundColor: 'hsl(var(--light-bg))', minHeight: '100vh', paddingBottom: '5rem' }}>
      <div className="container">
        <header className="header">
          <Link href={session ? "/inicio" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: 'hsl(var(--primary))', width: '35px', height: '35px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={20} /></div>
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
          <div style={{ background: 'hsl(var(--primary))', padding: '2rem 3rem', borderRadius: '1.5rem', color: 'white', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Encuentra a tu tutor ideal</h1>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: 'white', padding: '0.8rem', borderRadius: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 180px', gap: '0.5rem' }}>
                <Search size={20} style={{ color: '#9ca3af' }} />
                <input type="text" placeholder="Materia o nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') cargarTutores(); }}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'hsl(var(--foreground))' }} />
              </div>
              <select value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)}
                style={{ border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', padding: '0.4rem', fontSize: '0.85rem', color: 'hsl(var(--foreground))', background: 'white' }}>
                <option value="">Materia</option>
                {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
              <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}
                style={{ border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', padding: '0.4rem', fontSize: '0.85rem', color: 'hsl(var(--foreground))', background: 'white' }}>
                <option value="">Nivel</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Universidad">Universidad</option>
              </select>
              <select value={filtroDia} onChange={e => setFiltroDia(e.target.value)}
                style={{ border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', padding: '0.4rem', fontSize: '0.85rem', color: 'hsl(var(--foreground))', background: 'white' }}>
                <option value="">Día</option>
                {diasSemanaOpts.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <input type="time" value={filtroHora} onChange={e => setFiltroHora(e.target.value)}
                style={{ border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', padding: '0.4rem', fontSize: '0.85rem', color: 'hsl(var(--foreground))', background: 'white', width: '100px' }} />
              <select value={filtroRepMin} onChange={e => setFiltroRepMin(e.target.value)}
                style={{ border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', padding: '0.4rem', fontSize: '0.85rem', color: 'hsl(var(--foreground))', background: 'white' }}>
                <option value="">Reputación</option>
                <option value="4">4+ estrellas</option>
                <option value="4.5">4.5+ estrellas</option>
              </select>
              <button onClick={cargarTutores} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Buscar</button>
              <button onClick={usarMiUbicacion} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Navigation size={14} /> Cerca de mí
              </button>
            </div>
            {filtroUbicacion && (
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>📍 Filtrando por ubicación: {filtroUbicacion}</p>
            )}
            {flashBookingMsg && (
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#bbf7d0', fontWeight: 600 }}>{flashBookingMsg}</p>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'hsl(var(--muted-foreground))' }}>Buscando tutores...</div>
          ) : tutores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'hsl(var(--muted-foreground))' }}>No se encontraron tutores.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
              {tutores.map(t => {
                const materiaPrinc = t.materias[0];
                return (
                  <div key={t.usuarioId} style={{ background: 'white', borderRadius: '1rem', border: '1px solid hsl(var(--border))', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition: 'transform 0.2s' }}
                    className="animate-fade-in">
                    <div style={{ width: '100%', height: '200px', position: 'relative', ...getTutorImageStyle(t.usuario.nombreCompleto) }}>
                      {t.activoAhoraFlash && (
                        <span style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', background: '#22c55e', color: 'white', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>DISPONIBLE AHORA</span>
                      )}
                      {t.latitud && t.longitud && (
                        <span style={{ position: 'absolute', bottom: '0.8rem', left: '0.8rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={12} /> {t.latitud.toFixed(2)}, {t.longitud.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{t.usuario.nombreCompleto}</h3>
                          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <MapPin size={14} /> {(() => { try { return JSON.parse(t.biografia || '{}').paisOrigen || 'Online' } catch { return 'Online' }})()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {renderStars(t.reputacionPromedio)}
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', marginLeft: '0.3rem' }}>{t.reputacionPromedio.toFixed(1)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {t.materias.slice(0, 3).map(m => (
                          <span key={m.materia.id} style={{ background: '#f3f0ff', color: 'hsl(var(--primary))', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                            {m.materia.nombre}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'hsl(var(--foreground))' }}>
                          S/ {materiaPrinc?.tarifaPorHora || 50}<span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>/hr</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {session?.rol === 'ESTUDIANTE' && (
                            <>
                              {t.activoAhoraFlash && (
                                <button onClick={() => handleFlashBooking(t.usuarioId, materiaPrinc?.materia?.id || '')}
                                  disabled={flashBookingStatus[t.usuarioId] === 'loading'}
                                  style={{ background: '#22c55e', color: 'white', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Zap size={14} /> {flashBookingStatus[t.usuarioId] === 'loading' ? '...' : 'Ahora'}
                                </button>
                              )}
                              <button onClick={() => { setBookingTutor(t); setBookingStatus(null); setBookingMsg(''); setBookingMateriaId(materiaPrinc?.materia?.id || ''); setBookingFecha(defaultFecha); setBookingHoraInicio('10:00'); }}
                                className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Calendar size={16} /> Reservar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {t.disponibilidades.length > 0 && (
                        <details style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Ver horarios disponibles</summary>
                          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {t.disponibilidades.map(d => (
                              <span key={d.id} style={{ background: '#f3f0ff', padding: '0.2rem 0.5rem', borderRadius: '0.3rem' }}>
                                {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d.diaSemana]}: {d.horaInicio} - {d.horaFin}
                              </span>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {bookingTutor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setBookingTutor(null); }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reservar con {bookingTutor.usuario.nombreCompleto}</h2>
              <button onClick={() => setBookingTutor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}><X /></button>
            </div>

            {bookingStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <p style={{ fontSize: '1.1rem', marginTop: '1rem', fontWeight: 600 }}>{bookingMsg}</p>
                <button onClick={() => setBookingTutor(null)} className="btn-primary" style={{ marginTop: '1.5rem' }}>Cerrar</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Materia</label>
                  <select value={bookingMateriaId} onChange={e => setBookingMateriaId(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))' }}>
                    <option value="">Seleccionar materia</option>
                    {bookingTutor.materias.map(m => (
                      <option key={m.materia.id} value={m.materia.id}>{m.materia.nombre} - S/ {m.tarifaPorHora}/hr</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Fecha</label>
                    <input type="date" value={bookingFecha} onChange={e => setBookingFecha(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Hora inicio</label>
                    <input type="time" value={bookingHoraInicio} onChange={e => setBookingHoraInicio(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Duración</label>
                  <select value={bookingDuracion} onChange={e => setBookingDuracion(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))' }}>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1.5 horas</option>
                    <option value="120">2 horas</option>
                  </select>
                </div>

                {bookingStatus === 'error' && (
                  <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.8rem', borderRadius: '0.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                    {bookingMsg}
                  </div>
                )}

                <button onClick={handleBooking} disabled={bookingStatus === 'loading'} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                  {bookingStatus === 'loading' ? 'Reservando...' : 'Solicitar Tutoría'}
                </button>
                {!session && <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.9rem' }}>Debes iniciar sesión como estudiante para reservar.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

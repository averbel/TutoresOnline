"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Video, Check, X, User, Star, Zap, Calendar, BookOpen } from 'lucide-react';

type SessionData = { id: string; nombreCompleto: string; email: string; rol: string };
type ResenaData = { id: string; tutoriaId: string; calificacionEstrellas: number; feedback?: string; tutoria: { estudiante: { usuario: { nombreCompleto: string } }; materia: { nombre: string } } };

export default function MiPerfil() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [disponibilidades, setDisponibilidades] = useState<{ id?: string; diaSemana: number; horaInicio: string; horaFin: string }[]>([]);
  type SolicitudData = {
    id: string; estado: string; fechaInicio: string; fechaFin: string; urlEncuentro?: string;
    materia?: { id: string; nombre: string };
    estudiante?: { usuario: { nombreCompleto: string } };
    tutor?: { usuario: { nombreCompleto: string } };
  };
  const [solicitudes, setSolicitudes] = useState<SolicitudData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [flashActivo, setFlashActivo] = useState(false);
  const [tutoresDisponibles, setTutoresDisponibles] = useState(0);
  const [resenas, setResenas] = useState<ResenaData[]>([]);
  const [showResenaForm, setShowResenaForm] = useState<string | null>(null);
  const [resenaRating, setResenaRating] = useState(5);
  const [resenaFeedback, setResenaFeedback] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          const user = data.data;
          setSession(user);
          if (user.id) fetchUserData(user);
        } else { window.location.href = '/'; }
      })
      .catch(() => { window.location.href = '/'; });
  }, []);

  const fetchUserData = async (user: SessionData) => {
    setLoading(true);
    try {
      if (user.rol === 'TUTOR') {
        const [dispRes, solRes, flashRes] = await Promise.all([
          fetch(`/api/tutores/${user.id}/disponibilidades`),
          fetch(`/api/tutores/${user.id}/solicitudes`),
          fetch(`/api/tutores/${user.id}/resenas`),
        ]);
        const dispData = await dispRes.json();
        const solData = await solRes.json();
        const flashData = await flashRes.json();
        if (dispData.status === 'success') setDisponibilidades(dispData.data);
        if (solData.status === 'success') setSolicitudes(solData.data);
        if (flashData.status === 'success') setResenas(flashData.data);
      } else {
        const [solRes, tutoresRes] = await Promise.all([
          fetch(`/api/estudiantes/${user.id}/solicitudes`),
          fetch(`/api/usuarios/tutores?limit=1`),
        ]);
        const solData = await solRes.json();
        const tutoresData = await tutoresRes.json();
        if (solData.status === 'success') setSolicitudes(solData.data);
        if (tutoresData.status === 'success') setTutoresDisponibles(tutoresData.meta.total);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleSaveDisponibilidad = async () => {
    if (!session?.id) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/tutores/${session.id}/disponibilidades`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponibilidades })
      });
      const data = await res.json();
      if (data.status === 'success') setDisponibilidades(data.data);
      else alert("Error: " + data.message);
    } catch { alert("Error de red"); }
    finally { setIsSaving(false); }
  };

  const toggleFlash = async () => {
    const nuevo = !flashActivo;
    setFlashActivo(nuevo);
    try {
      await fetch('/api/tutores/flash', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevo })
      });
    } catch { setFlashActivo(!nuevo); }
  };

  const updateEstadoTutoria = async (tutoriaId: string, nuevoEstado: string) => {
    try {
      const res = await fetch(`/api/tutores/tutorias/${tutoriaId}/estado`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.status === 'success') {
        if (nuevoEstado === 'RECHAZADA') setSolicitudes(prev => prev.filter(s => s.id !== tutoriaId));
        else setSolicitudes(prev => prev.map(s => s.id === tutoriaId ? { ...s, estado: 'ACEPTADA', urlEncuentro: data.data.urlEncuentro } : s));
      } else alert("Error: " + data.message);
    } catch { alert("Error de red"); }
  };

  const completarTutoria = async (tutoriaId: string) => {
    try {
      const res = await fetch(`/api/tutores/tutorias/${tutoriaId}/estado`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'COMPLETADA' })
      });
      const data = await res.json();
      if (data.status === 'success') setSolicitudes(prev => prev.map(s => s.id === tutoriaId ? { ...s, estado: 'COMPLETADA' } : s));
    } catch { alert("Error de red"); }
  };

  const enviarResena = async (tutoriaId: string) => {
    try {
      const res = await fetch(`/api/tutorias/${tutoriaId}/resenas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calificacionEstrellas: resenaRating, feedback: resenaFeedback })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowResenaForm(null);
        setResenaRating(5);
        setResenaFeedback('');
      } else alert("Error: " + data.message);
    } catch { alert("Error de red"); }
  };

  const addDisponibilidadSlot = () => setDisponibilidades(prev => [...prev, { diaSemana: 1, horaInicio: '08:00', horaFin: '10:00' }]);
  const removeDisponibilidadSlot = (index: number) => setDisponibilidades(prev => prev.filter((_, i) => i !== index));
  const updateSlot = (index: number, field: string, value: string | number) => setDisponibilidades(prev => { const n = [...prev]; n[index] = { ...n[index], [field]: value }; return n; });

  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  if (!session) return <div style={{ textAlign: 'center', padding: '4rem' }}>Cargando...</div>;
  const isTutor = session.rol === 'TUTOR';
  const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE');
  const proximas = solicitudes.filter(s => s.estado === 'ACEPTADA');
  const completadas = solicitudes.filter(s => s.estado === 'COMPLETADA');

  const puedeIngresarAVideollamada = (fechaInicio: string, fechaFin: string) => {
    const ahora = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const quinceMinAntes = new Date(inicio.getTime() - 15 * 60000);
    return ahora >= quinceMinAntes && ahora <= fin;
  };

  const tiempoParaInicio = (fechaInicio: string) => {
    const ahora = new Date();
    const inicio = new Date(fechaInicio);
    const diff = inicio.getTime() - ahora.getTime();
    if (diff <= 0) return null;
    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
    if (horas > 0) return `en ${horas}h ${minutos}m`;
    return `en ${minutos}m`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row' }}>
      <aside style={{ width: '300px', backgroundColor: 'rgba(0,0,0,0.3)', borderRight: '1px solid hsl(var(--border))', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            {isTutor ? <GraduationCap size={48} className="text-gray-300" /> : <User size={48} className="text-gray-300" />}
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{isTutor ? 'Tutor Workspace' : 'Panel de Estudiante'}</h2>
          <p style={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}>{session.nombreCompleto}</p>
          {isTutor && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Zap size={20} style={{ color: flashActivo ? '#22c55e' : '#9ca3af' }} />
              <button onClick={toggleFlash}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: flashActivo ? '#22c55e' : '#6b7280', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                {flashActivo ? 'Flash Activado' : 'Activar Flash'}
              </button>
            </div>
          )}
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'hsl(var(--primary))', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Panel Principal</div>
          <Link href="/inicio" style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}>Volver al Inicio</Link>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '2rem', maxWidth: '100%' }}>
        {!isTutor && (
          <div className="glass-card mb-8">
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Bienvenido, {session.nombreCompleto}</h1>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>{session.email} &bull; Rol: {session.rol}</p>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BookOpen size={24} style={{ color: 'hsl(var(--primary))' }} />
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{tutoresDisponibles}</div>
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Tutores Disponibles</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isTutor ? 'minmax(400px, 1fr) 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
          {isTutor && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                Configuración de Horarios
              </h3>
              {loading ? (<p>Cargando...</p>) : (
                <div>
                  {disponibilidades.map((slot, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px' }}>
                      <select value={slot.diaSemana} onChange={(e) => updateSlot(idx, 'diaSemana', parseInt(e.target.value))}
                        style={{ padding: '0.5rem', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', border: '1px solid rgba(255,255,255,0.2)' }}>
                        {diasSemana.map((d, i) => <option key={i} value={i}>{d}</option>)}
                      </select>
                      <input type="time" value={slot.horaInicio} onChange={(e) => updateSlot(idx, 'horaInicio', e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', border: '1px solid rgba(255,255,255,0.2)' }} />
                      <input type="time" value={slot.horaFin} onChange={(e) => updateSlot(idx, 'horaFin', e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', border: '1px solid rgba(255,255,255,0.2)' }} />
                      <button onClick={() => removeDisponibilidadSlot(idx)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button onClick={addDisponibilidadSlot} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>+ Agregar Rango</button>
                    <button onClick={handleSaveDisponibilidad} className="btn-primary" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Horarios'}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card" style={{ borderLeft: '4px solid hsl(var(--primary))' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                Próximas Tutorías
              </h3>
              {loading ? (<p>Cargando...</p>) : proximas.length === 0 ? (
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>No tienes reuniones programadas.</p>
              ) : (
                proximas.map(sol => (
                  <div key={sol.id} style={{ marginBottom: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'hsl(var(--primary))', fontSize: '1.1rem' }}>{sol.materia?.nombre || 'Desconocida'}</div>
                        <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
                          {isTutor ? `Estudiante: ${sol.estudiante?.usuario?.nombreCompleto}` : `Tutor: ${sol.tutor?.usuario?.nombreCompleto}`}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>{new Date(sol.fechaInicio).toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {(() => {
                          const puede = puedeIngresarAVideollamada(sol.fechaInicio, sol.fechaFin);
                          const tiempo = tiempoParaInicio(sol.fechaInicio);
                          return (
                            <>
                              {!puede && tiempo && (
                                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>
                                  Disponible {tiempo}
                                </span>
                              )}
                              <button onClick={() => { if (puede) setActiveCallId(activeCallId === sol.id ? null : sol.id); }}
                                disabled={!puede}
                                className="btn-primary"
                                style={{
                                  padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                  opacity: puede ? 1 : 0.5, cursor: puede ? 'pointer' : 'not-allowed'
                                }}>
                                <Video size={16} /> {activeCallId === sol.id ? 'Cerrar' : 'Ingresar'}
                              </button>
                            </>
                          );
                        })()}
                        {isTutor && (
                          <button onClick={() => completarTutoria(sol.id)} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                            Completar
                          </button>
                        )}
                      </div>
                    </div>
                    {activeCallId === sol.id && sol.urlEncuentro && (
                      <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <iframe src={`${sol.urlEncuentro}?config.prejoinPageEnabled=false`} allow="camera; microphone; fullscreen; display-capture; autoplay"
                          style={{ width: '100%', height: '400px', border: 'none' }} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                {isTutor ? 'Solicitudes Entrantes' : 'Mis Solicitudes Pendientes'}
              </h3>
              {loading ? (<p>Cargando...</p>) : pendientes.length === 0 ? (
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Sin nuevas peticiones.</p>
              ) : (
                pendientes.map(s => (
                  <div key={s.id} style={{ marginBottom: '0.8rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    <div><strong>Materia:</strong> {s.materia?.nombre || 'Desconocida'}</div>
                    <div><strong>{isTutor ? 'Estudiante' : 'Tutor'}:</strong> {isTutor ? s.estudiante?.usuario?.nombreCompleto : s.tutor?.usuario?.nombreCompleto}</div>
                    <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>{new Date(s.fechaInicio).toLocaleString()}</div>
                    {isTutor ? (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={() => updateEstadoTutoria(s.id, 'ACEPTADA')} style={{ flex: 1, background: '#2ecc71', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><Check size={16} /> Aceptar</button>
                        <button onClick={() => updateEstadoTutoria(s.id, 'RECHAZADA')} style={{ flex: 1, background: '#e74c3c', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><X size={16} /> Rechazar</button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '0.5rem', color: '#f1c40f', fontWeight: 'bold' }}>Esperando confirmación...</div>
                    )}
                  </div>
                ))
              )}
            </div>

            {completadas.length > 0 && (
              <div className="glass-card">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  Tutorías Completadas
                </h3>
                {completadas.map(s => (
                  <div key={s.id} style={{ marginBottom: '0.8rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{s.materia?.nombre || 'Desconocida'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                          {isTutor ? `Estudiante: ${s.estudiante?.usuario?.nombreCompleto}` : `Tutor: ${s.tutor?.usuario?.nombreCompleto}`}
                        </div>
                      </div>
                      {!isTutor && !completadas.find(r => r.id === s.id) && (
                        <button onClick={() => setShowResenaForm(showResenaForm === s.id ? null : s.id)}
                          style={{ background: 'transparent', border: '1px solid hsl(var(--primary))', color: 'hsl(var(--primary))', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                          <Star size={16} style={{ display: 'inline' }} /> Calificar
                        </button>
                      )}
                    </div>
                    {showResenaForm === s.id && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Calificación:</div>
                        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1rem' }}>
                          {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => setResenaRating(n)}
                              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: n <= resenaRating ? '#f59e0b' : '#6b7280', transition: '0.2s' }}>
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea placeholder="Escribe un comentario (opcional)" value={resenaFeedback} onChange={e => setResenaFeedback(e.target.value)}
                          style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', resize: 'vertical', minHeight: '80px', marginBottom: '1rem' }} />
                        <button onClick={() => enviarResena(s.id)} className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Enviar Reseña</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isTutor && resenas.length > 0 && (
              <div className="glass-card">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  Reseñas Recibidas
                </h3>
                {resenas.map(r => (
                  <div key={r.id} style={{ marginBottom: '0.8rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold' }}>{r.tutoria.estudiante.usuario.nombreCompleto}</span>
                      <span>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ color: i < r.calificacionEstrellas ? '#f59e0b' : '#6b7280' }}>★</span>)}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>{r.tutoria.materia.nombre}</div>
                    {r.feedback && <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>"{r.feedback}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

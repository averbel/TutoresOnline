"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Video, Check, X, User } from 'lucide-react';

export default function MiPerfil() {
  const [session, setSession] = useState<{ id?: string, nombreCompleto: string; email: string; rol: string } | null>(null);
  const [disponibilidades, setDisponibilidades] = useState<{ diaSemana: number, horaInicio: string, horaFin: string }[]>([]);
  type SolicitudData = {
    id: string;
    estado: string;
    fechaInicio: string;
    urlEncuentro?: string;
    materia?: { nombre: string };
    estudiante?: { usuario: { nombreCompleto: string } };
    tutor?: { usuario: { nombreCompleto: string } };
  };
  const [solicitudes, setSolicitudes] = useState<SolicitudData[]>([]);
  const [loadingTutorData, setLoadingTutorData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para la videollamada activa
  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setSession(parsedUser);
      if (parsedUser.id) {
        fetchUserData(parsedUser);
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  const fetchUserData = async (user: { id: string; rol: string }) => {
    setLoadingTutorData(true);
    try {
      if (user.rol === 'TUTOR') {
        const [dispRes, solRes] = await Promise.all([
          fetch(`/api/tutores/${user.id}/disponibilidades`),
          fetch(`/api/tutores/${user.id}/solicitudes`)
        ]);
        const dispData = await dispRes.json();
        const solData = await solRes.json();

        if (dispData.status === 'success') setDisponibilidades(dispData.data);
        if (solData.status === 'success') setSolicitudes(solData.data);
      } else {
        const solRes = await fetch(`/api/estudiantes/${user.id}/solicitudes`);
        const solData = await solRes.json();
        if (solData.status === 'success') setSolicitudes(solData.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingTutorData(false);
    }
  };

  const handleSaveDisponibilidad = async () => {
    if (!session?.id) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/tutores/${session.id}/disponibilidades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponibilidades })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setDisponibilidades(data.data);
        alert("Disponibilidad guardada con éxito!");
      } else {
        alert("Error al guardar: " + data.message);
      }
    } catch {
      alert("Error de red guardando disponibilidad.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateEstadoTutoria = async (tutoriaId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/tutores/tutorias/${tutoriaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await response.json();
      if (data.status === 'success') {
        if (nuevoEstado === 'RECHAZADA') {
          setSolicitudes(prev => prev.filter(s => s.id !== tutoriaId));
        } else {
          setSolicitudes(prev => prev.map(s =>
            s.id === tutoriaId
              ? { ...s, estado: 'ACEPTADA', urlEncuentro: data.data.urlEncuentro }
              : s
          ));
        }
      } else {
        alert("Error actualizando: " + data.message);
      }
    } catch {
      alert("Error de red actualizando solicitud.");
    }
  };

  const addDisponibilidadSlot = () => {
    setDisponibilidades(prev => [...prev, { diaSemana: 1, horaInicio: '08:00', horaFin: '10:00' }]);
  };

  const removeDisponibilidadSlot = (index: number) => {
    setDisponibilidades(prev => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: string | number) => {
    setDisponibilidades(prev => {
      const newSlots = [...prev];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return newSlots;
    });
  };

  const toggleVideoCall = (tutoriaId: string) => {
    if (activeCallId === tutoriaId) {
      setActiveCallId(null);
    } else {
      setActiveCallId(tutoriaId);
    }
  };

  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  if (!session) return <div style={{ textAlign: 'center', padding: '4rem' }}>Cargando datos de seguridad...</div>;

  const isTutor = session.rol === 'TUTOR';

  const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE');
  const proximas = solicitudes.filter(s => s.estado === 'ACEPTADA');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row' }}>

      {/* Sidebar para Tutores y Estudiantes */}
      <aside style={{ width: '300px', backgroundColor: 'rgba(0,0,0,0.3)', borderRight: '1px solid hsl(var(--border))', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            {isTutor ? <GraduationCap size={48} className="text-gray-300" /> : <User size={48} className="text-gray-300" />}
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{isTutor ? 'Tutor Workspace' : 'Panel de Estudiante'}</h2>
          <p style={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}>{session.nombreCompleto}</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'hsl(var(--primary))', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Panel Principal
          </div>
          <Link href="/inicio" style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textDecoration: 'none', cursor: 'pointer' }}>
            Volver al Inicio
          </Link>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '100%' }}>

        {!isTutor && (
          <div className="glass-card mb-8">
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Bienvenido, {session.nombreCompleto}</h1>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>{session.email} &bull; Rol: {session.rol}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isTutor ? 'minmax(400px, 1fr) 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>

          {/* COLUMNA IZQUIERDA: DISPONIBILIDAD (Solo Tutores) */}
          {isTutor && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                Configuración de Horarios
              </h3>

              {loadingTutorData ? (
                <p>Cargando disponibilidad...</p>
              ) : (
                <div>
                  {disponibilidades.length === 0 ? (
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>No tienes horarios registrados.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      {disponibilidades.map((slot, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                          <select
                            style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', border: '1px solid rgba(255,255,255,0.2)' }}
                            value={slot.diaSemana}
                            onChange={(e) => updateSlot(idx, 'diaSemana', parseInt(e.target.value))}
                          >
                            {diasSemana.map((d, i) => <option key={i} value={i}>{d}</option>)}
                          </select>

                          <input
                            type="time"
                            value={slot.horaInicio}
                            style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', border: '1px solid rgba(255,255,255,0.2)' }}
                            onChange={(e) => updateSlot(idx, 'horaInicio', e.target.value)}
                          />
                          <input
                            type="time"
                            value={slot.horaFin}
                            style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', border: '1px solid rgba(255,255,255,0.2)' }}
                            onChange={(e) => updateSlot(idx, 'horaFin', e.target.value)}
                          />
                          <button
                            onClick={() => removeDisponibilidadSlot(idx)}
                            style={{ marginLeft: 'auto', backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                    <button onClick={addDisponibilidadSlot} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      + Agregar Rango
                    </button>
                    <button onClick={handleSaveDisponibilidad} className="btn-primary" disabled={isSaving}>
                      {isSaving ? 'Guardando...' : 'Guardar Horarios'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COLUMNA DERECHA/CENTRAL: SOLICITUDES Y ENCUENTROS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* PRÓXIMAS REUNIONES (ACEPTADAS) */}
            <div className="glass-card" style={{ borderLeft: '4px solid hsl(var(--primary))' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                Próximas Tutorías
              </h3>
              {loadingTutorData ? (
                <p>Cargando...</p>
              ) : proximas.length === 0 ? (
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>No tienes reuniones programadas.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {proximas.map(sol => (
                    <div key={sol.id} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'hsl(var(--primary))', fontSize: '1.1rem' }}>{sol.materia?.nombre || 'Desconocida'}</div>
                          <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
                            {isTutor 
                              ? `Estudiante: ${sol.estudiante?.usuario?.nombreCompleto}`
                              : `Tutor: ${sol.tutor?.usuario?.nombreCompleto}`}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Fecha: {new Date(sol.fechaInicio).toLocaleString()}</div>
                        </div>
                        <button 
                          onClick={() => toggleVideoCall(sol.id)}
                          className="btn-primary" 
                          style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <Video size={20} />
                          {activeCallId === sol.id ? 'Cerrar videollamada' : 'Iniciar videollamada'}
                        </button>
                      </div>

                      {/* Jitsi Iframe */}
                      {activeCallId === sol.id && (
                        <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                           <iframe 
                              src={`https://meet.jit.si/tutoresonline-${sol.id}?config.prejoinPageEnabled=false`} 
                              allow="camera; microphone; fullscreen; display-capture; autoplay"
                              style={{ width: '100%', height: '500px', border: 'none' }}
                           />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SOLICITUDES PENDIENTES */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                {isTutor ? 'Solicitudes Entrantes' : 'Mis Solicitudes Pendientes'}
              </h3>

                {loadingTutorData ? (
                  <p>Cargando solicitudes...</p>
                ) : pendientes.length === 0 ? (
                  <p style={{ color: 'hsl(var(--muted-foreground))' }}>Sin nuevas peticiones.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pendientes.map(solicitud => (
                      <div key={solicitud.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <div><strong>Materia:</strong> {solicitud.materia?.nombre || 'Desconocida'}</div>
                        <div><strong>{isTutor ? 'Estudiante' : 'Tutor'}:</strong> {isTutor ? solicitud.estudiante?.usuario?.nombreCompleto : solicitud.tutor?.usuario?.nombreCompleto}</div>
                        <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Fecha solicitada: {new Date(solicitud.fechaInicio).toLocaleString()}</div>

                        {isTutor ? (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button
                              onClick={() => updateEstadoTutoria(solicitud.id, 'ACEPTADA')}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', flex: 1, backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              <Check size={18} /> Aceptar
                            </button>
                            <button
                              onClick={() => updateEstadoTutoria(solicitud.id, 'RECHAZADA')}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', flex: 1, backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              <X size={18} /> Rechazar
                            </button>
                          </div>
                        ) : (
                          <div style={{ marginTop: '0.5rem', color: '#f1c40f', fontWeight: 'bold' }}>Esperando confirmación...</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

          </div>
        </div>
      </main>
    </div>
  );
}

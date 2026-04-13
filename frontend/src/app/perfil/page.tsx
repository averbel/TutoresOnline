"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
  };
  const [solicitudes, setSolicitudes] = useState<SolicitudData[]>([]);
  const [loadingTutorData, setLoadingTutorData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setSession(parsedUser);
      if (parsedUser.rol === 'TUTOR' && parsedUser.id) {
        fetchTutorData(parsedUser.id);
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  const fetchTutorData = async (tutorId: string) => {
    setLoadingTutorData(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const [dispRes, solRes] = await Promise.all([
        fetch(`${API_URL}/api/tutores/${tutorId}/disponibilidades`),
        fetch(`${API_URL}/api/tutores/${tutorId}/solicitudes`)
      ]);
      const dispData = await dispRes.json();
      const solData = await solRes.json();

      if (dispData.status === 'success') setDisponibilidades(dispData.data);
      if (solData.status === 'success') setSolicitudes(solData.data);
    } catch (error) {
      console.error("Error fetching tutor data:", error);
    } finally {
      setLoadingTutorData(false);
    }
  };

  const handleSaveDisponibilidad = async () => {
    if (!session?.id) return;
    setIsSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/tutores/${session.id}/disponibilidades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponibilidades })
      });
      const data = await response.json();
      if (data.status === 'success') {
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/tutores/tutorias/${tutoriaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await response.json();
      if (data.status === 'success') {
        // Actualizar localmente el estado o filtrar
        if (nuevoEstado === 'RECHAZADA') {
          setSolicitudes(prev => prev.filter(s => s.id !== tutoriaId));
        } else {
          // Lo marcamos como aceptada localmente y guardamos su URL 
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
    const newSlots = [...disponibilidades];
    (newSlots[index] as Record<string, string | number>)[field] = value;
    setDisponibilidades(newSlots);
  };

  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  if (!session) return <div style={{ textAlign: 'center', padding: '4rem' }}>Cargando datos de seguridad...</div>;

  const isTutor = session.rol === 'TUTOR';

  const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE');
  const proximas = solicitudes.filter(s => s.estado === 'ACEPTADA');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: isTutor ? 'row' : 'column' }}>

      {/* Sidebar para Tutores */}
      {isTutor && (
        <aside style={{ width: '300px', backgroundColor: 'rgba(0,0,0,0.3)', borderRight: '1px solid var(--border)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto 1rem auto' }}>
              🎓
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Tutor Workspace</h2>
            <p style={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}>{session.nombreCompleto}</p>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'hsl(var(--primary))', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Panel Principal
            </div>
            <Link href="/inicio" style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textDecoration: 'none', cursor: 'pointer' }}>
              Volver a la Tienda
            </Link>
          </nav>
        </aside>
      )}

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: isTutor ? '100%' : '800px', margin: isTutor ? '0' : '4rem auto' }}>

        {/* Cabecera para no-tutores (Estudiantes / Admins) */}
        {!isTutor && (
          <div className="glass-card mb-8">
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{session.nombreCompleto}</h1>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>{session.email} &bull; Rol: {session.rol}</p>
          </div>
        )}

        {isTutor && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '2rem', alignItems: 'start' }}>

            {/* COLUMNA IZQUIERDA: DISPONIBILIDAD */}
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
                            X
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

            {/* COLUMNA DERECHA: SOLICITUDES Y ENCUENTROS */}
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
                      <div key={sol.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{sol.materia?.nombre || 'Desconocida'}</div>
                          <div style={{ fontSize: '0.9rem' }}>Estudiante: {sol.estudiante?.usuario?.nombreCompleto}</div>
                        </div>
                        <Link href={`/aula/${sol.id}?url=${encodeURIComponent(sol.urlEncuentro || '')}`} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                          ➜ Ir al Aula Virtual
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SOLICITUDES PENDIENTES */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  Solicitudes Entrantes
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
                        <div><strong>Estudiante:</strong> {solicitud.estudiante?.usuario?.nombreCompleto}</div>
                        <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Fecha solicitada: {new Date(solicitud.fechaInicio).toLocaleString()}</div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                          <button
                            onClick={() => updateEstadoTutoria(solicitud.id, 'ACEPTADA')}
                            style={{ flex: 1, backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Aceptar ✔
                          </button>
                          <button
                            onClick={() => updateEstadoTutoria(solicitud.id, 'RECHAZADA')}
                            style={{ flex: 1, backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Rechazar ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {!isTutor && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/" className="btn-secondary" style={{ display: 'inline-block', textDecoration: 'none', padding: '0.8rem 2rem' }}>
              Volver al Inicio
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}

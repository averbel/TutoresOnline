"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AulaVirtual() {
  const params = useParams();
  const tutoriaId = params.id as string;
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  useEffect(() => {
    // Para simplificar: Leemos la URL desde la querystring o simulamos que la obtenemos.
    // Lo ideal seria hacer fetch de la Tutoría para obtener `urlEncuentro`.
    // Asumiremos que el frontend la redirige aquí con un queryParam o hacemos un fetch.
    
    // Generar o usar el URL:
    const paramsUrl = new URLSearchParams(window.location.search);
    const url = paramsUrl.get('url');

    if (url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoomUrl(url);
    } else {
      // Como fallback de demostracion si no viene en querystring
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoomUrl(`https://meet.jit.si/TutoresOnLine-${tutoriaId}`);
    }
  }, [tutoriaId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#111' }}>
      <header style={{ padding: '1rem 2rem', background: '#000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Aula Virtual - TutoresOn-Line</h2>
        <Link href="/perfil" className="btn-secondary" style={{ borderColor: 'white', color: 'white' }}>
          Salir de la clase
        </Link>
      </header>
      
      <main style={{ flex: 1, position: 'relative' }}>
        {roomUrl ? (
          <iframe 
            src={`${roomUrl}?config.prejoinPageEnabled=false`} 
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Cargando sala...</div>
        )}
      </main>
    </div>
  );
}

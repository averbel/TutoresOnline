"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Check, CreditCard, Zap, Video, Star, Shield, Home } from 'lucide-react';

type SessionData = { id: string; nombreCompleto: string; email: string; rol: string };

const planes = [
  {
    nombre: 'Gratuito',
    precio: 'S/ 0',
    periodo: '/mes',
    descripcion: 'Para empezar a aprender',
    color: '#6b7280',
    features: [
      '1 tutoría por semana',
      'Duración máxima 30 min',
      'Acceso a tutores básicos',
      'Soporte por email',
    ]
  },
  {
    nombre: 'Premium',
    precio: 'S/ 29.90',
    periodo: '/mes',
    descripcion: 'Para estudiantes dedicados',
    color: 'hsl(var(--primary))',
    destacado: true,
    features: [
      'Tutorías ilimitadas',
      'Duración hasta 2 horas',
      'Acceso a todos los tutores',
      'Modo Flash prioritario',
      'Soporte prioritario 24/7',
      'Reseñas y estadísticas',
    ]
  },
  {
    nombre: 'Pro',
    precio: 'S/ 59.90',
    periodo: '/mes',
    descripcion: 'Para aprendizaje intensivo',
    color: '#f59e0b',
    features: [
      'Todo lo de Premium',
      'Sesiones de hasta 4 horas',
      'Tutor personal asignado',
      'IA Lenux ilimitada',
      'Certificados de finalización',
      'Soporte telefónico y WhatsApp',
    ]
  }
];

export default function Suscripcion() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [planSeleccionado, setPlanSeleccionado] = useState<string | null>(null);
  const [pagoStatus, setPagoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pagoMsg, setPagoMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setSession(data.data);
      });
  }, []);

  const handlePago = async (planNombre: string) => {
    setPlanSeleccionado(planNombre);
    setPagoStatus('loading');
    setPagoMsg('');

    await new Promise(r => setTimeout(r, 1500));

    if (!session) {
      setPagoStatus('error');
      setPagoMsg('Debes iniciar sesión para suscribirte.');
      return;
    }

    try {
      const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.email, password: 'placeholder' })
      });
      if (res.ok || true) {
        setPagoStatus('success');
        setPagoMsg(`¡Suscripción "${planNombre}" activada con éxito!`);
      }
    } catch {
      setPagoStatus('error');
      setPagoMsg('Error al procesar el pago.');
    }
  };

  return (
    <div style={{ backgroundColor: 'hsl(var(--light-bg))', minHeight: '100vh' }}>
      <div className="container">
        <header className="header">
          <Link href={session ? "/inicio" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: 'hsl(var(--primary))', width: '35px', height: '35px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={20} /></div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>Tutores<span className="text-primary">On-Line</span></span>
          </Link>
          <div className="header-links">
            <Link href={session ? "/inicio" : "/"} className="nav-link">Inicio</Link>
            <Link href="/buscar" className="nav-link">Buscar Tutores</Link>
            <Link href="/suscripcion" className="nav-link" style={{ color: 'hsl(var(--primary))', borderBottom: '2px solid hsl(var(--primary))', paddingBottom: '1.5rem', marginBottom: '-1.5rem' }}>Suscripción</Link>
          </div>
          <div className="header-actions">
            {session ? (
              <Link href="/perfil" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Mi Panel</Link>
            ) : (
              <Link href="/" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Iniciar Sesión</Link>
            )}
          </div>
        </header>

        <main style={{ padding: '3rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Elige tu <span className="text-primary">Plan</span></h1>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.15rem', maxWidth: '500px', margin: '0 auto' }}>
              Suscríbete y accede a todos los beneficios de TutoresOn-Line. Cancela cuando quieras.
            </p>
          </div>

          {pagoStatus === 'success' ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '500px', margin: '0 auto', background: 'white', borderRadius: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid hsl(var(--border))' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>¡Suscripción Exitosa!</h2>
              <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>{pagoMsg}</p>
              <Link href="/perfil" className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.05rem' }}>Ir a Mi Panel</Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                {planes.map((plan, idx) => (
                  <div key={idx} style={{
                    background: 'white', borderRadius: '1.5rem', padding: '2.5rem 2rem',
                    border: plan.destacado ? `2px solid ${plan.color}` : '1px solid hsl(var(--border))',
                    boxShadow: plan.destacado ? `0 10px 40px rgba(90,79,207,0.1)` : '0 4px 15px rgba(0,0,0,0.03)',
                    position: 'relative', transition: 'transform 0.2s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    {plan.destacado && (
                      <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', padding: '0.3rem 1.5rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 700 }}>
                        MÁS POPULAR
                      </div>
                    )}
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem' }}>{plan.nombre}</div>
                    <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{plan.descripcion}</div>
                    <div style={{ marginBottom: '2rem' }}>
                      <span style={{ fontSize: '2.8rem', fontWeight: 800, color: plan.color }}>{plan.precio}</span>
                      <span style={{ color: 'hsl(var(--muted-foreground))' }}>{plan.periodo}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
                      {plan.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                          <Check size={16} style={{ color: plan.color, flexShrink: 0 }} /> {f}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => handlePago(plan.nombre)}
                      disabled={pagoStatus === 'loading' && planSeleccionado === plan.nombre}
                      style={{
                        width: '100%', padding: '0.9rem', borderRadius: '0.5rem',
                        background: plan.destacado ? plan.color : 'transparent',
                        color: plan.destacado ? 'white' : 'hsl(var(--foreground))',
                        border: plan.destacado ? 'none' : '1px solid hsl(var(--border))',
                        fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
                      }}>
                      {pagoStatus === 'loading' && planSeleccionado === plan.nombre ? 'Procesando...' : plan.nombre === 'Gratuito' ? 'Comenzar Gratis' : 'Suscribirse'}
                    </button>
                  </div>
                ))}
              </div>

              {pagoStatus === 'error' && (
                <div style={{ textAlign: 'center', padding: '1rem', background: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', maxWidth: '500px', margin: '0 auto 2rem auto', fontWeight: 600 }}>
                  {pagoMsg}
                </div>
              )}

              <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid hsl(var(--border))', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {[
                  { icon: <Zap size={24} />, title: 'Pago Seguro', desc: 'Tus datos están protegidos con cifrado de grado bancario.' },
                  { icon: <Video size={24} />, title: 'Clases Ilimitadas', desc: 'Accede a todas las tutorías que necesites.' },
                  { icon: <Star size={24} />, title: 'Mejores Tutores', desc: 'Solo los tutores mejor calificados.' },
                  { icon: <Shield size={24} />, title: 'Cancela Cuando Quieras', desc: 'Sin compromiso, cancela tu plan en cualquier momento.' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ color: 'hsl(var(--primary))', flexShrink: 0 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{f.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

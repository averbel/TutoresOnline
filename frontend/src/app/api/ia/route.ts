import { NextResponse } from 'next/server';

type Modo = 'asistente' | 'recomendador' | 'resumen' | 'soporte';


const PROMPTS_SISTEMA: Record<Modo, string> = {
  asistente: `Eres Lenux, asistente educativo de TutoresOnLine. 
Ayudas a estudiantes con dudas académicas de cualquier materia. 
Explica con claridad, usa ejemplos prácticos y emojis cuando sea útil. 
Si no sabes algo, dilo honestamente.`,

  recomendador: `Eres Lenux, asistente de TutoresOnLine especializado en recomendar tutores. 
Cuando el estudiante describa lo que necesita (materia, nivel, disponibilidad, modalidad), 
sugiere el perfil ideal de tutor que debería buscar y qué criterios considerar.
Usa emojis y sé conciso.`,

  resumen: `Eres Lenux, asistente de TutoresOnLine especializado en resumir contenido educativo.
Cuando el usuario te dé un tema o pegue un texto, genera un resumen claro, estructurado y con emojis.
Incluye: concepto principal, puntos clave y un ejemplo si aplica.`,

  soporte: `Eres Lenux, agente de soporte de TutoresOnLine.
Responde preguntas frecuentes sobre la plataforma: cómo registrarse, reservar sesiones, 
gestionar disponibilidad, sistema de calificaciones y videollamadas.
Si la pregunta está fuera de la plataforma, redirige amablemente. Usa emojis.`,
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { status: 'error', message: 'API Key de OpenRouter no configurada.' },
        { status: 500 }
      );
    }

    const { modo, historial, mensaje } = await req.json();

    // Validaciones
    if (!modo || !PROMPTS_SISTEMA[modo as Modo]) {
      return NextResponse.json(
        { status: 'error', message: 'Modo inválido. Usa: asistente, recomendador, resumen o soporte.' },
        { status: 400 }
      );
    }

    if (!mensaje || typeof mensaje !== 'string') {
      return NextResponse.json(
        { status: 'error', message: 'El mensaje no puede estar vacío.' },
        { status: 400 }
      );
    }

    // Construir mensajes con historial de conversación
    const mensajes = [
      { role: 'system', content: PROMPTS_SISTEMA[modo as Modo] },
      ...(historial || []),
      { role: 'user', content: mensaje },
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
        'X-Title': 'TutoresOnLine',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: mensajes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`OpenRouter ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const respuesta = data.choices[0].message.content;

    return NextResponse.json({
      status: 'success',
      data: respuesta,
      modo,
    });

  } catch (error: unknown) {
    console.error('Error IA:', error);
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { status: 'error', message: msg },
      { status: 500 }
    );
  }
}

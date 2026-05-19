import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'No autenticado' }, { status: 401 });
    }
    if (session.rol !== 'ESTUDIANTE') {
      return NextResponse.json({ status: 'error', message: 'Solo estudiantes pueden reservar' }, { status: 403 });
    }

    const { tutorId, materiaId } = await req.json();

    if (!tutorId || !materiaId) {
      return NextResponse.json({ status: 'error', message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const tutor = await prisma.tutor.findUnique({
      where: { usuarioId: tutorId },
      include: { usuario: true }
    });

    if (!tutor || !tutor.activoAhoraFlash) {
      return NextResponse.json({ status: 'error', message: 'El tutor no está disponible en modo Flash' }, { status: 400 });
    }

    const ahora = new Date();
    const inicio = new Date(ahora.getTime() + 5 * 60000);
    const fin = new Date(inicio.getTime() + 60 * 60000);

    const solapamiento = await prisma.tutoria.findFirst({
      where: {
        tutorId,
        OR: [
          { fechaInicio: { lt: fin }, fechaFin: { gt: inicio } },
        ],
        estado: { in: ['PENDIENTE', 'ACEPTADA'] }
      }
    });

    if (solapamiento) {
      return NextResponse.json({ status: 'error', message: 'El tutor no está disponible ahora mismo' }, { status: 409 });
    }

    const tutoria = await prisma.tutoria.create({
      data: {
        estudianteId: session.id,
        tutorId,
        materiaId,
        fechaInicio: inicio,
        fechaFin: fin,
        estado: 'ACEPTADA',
        modalidad: 'VIRTUAL',
        urlEncuentro: `https://meet.jit.si/TutoresOnLine-Flash-${Date.now()}`,
      },
      include: {
        tutor: { include: { usuario: true } },
        materia: true,
      }
    });

    return NextResponse.json({ status: 'success', data: tutoria });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'error', message: 'Error al crear tutoría flash' }, { status: 500 });
  }
}

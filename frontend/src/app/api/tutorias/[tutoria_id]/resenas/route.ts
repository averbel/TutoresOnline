import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ tutoria_id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'No autenticado' }, { status: 401 });
    }

    const { tutoria_id } = await params;
    const { calificacionEstrellas, feedback } = await req.json();

    if (!calificacionEstrellas || calificacionEstrellas < 1 || calificacionEstrellas > 5) {
      return NextResponse.json({ status: 'error', message: 'Calificación debe ser entre 1 y 5' }, { status: 400 });
    }

    const tutoria = await prisma.tutoria.findUnique({
      where: { id: tutoria_id },
      include: { tutor: true }
    });

    if (!tutoria) {
      return NextResponse.json({ status: 'error', message: 'Tutoría no encontrada' }, { status: 404 });
    }
    if (tutoria.estudianteId !== session.id) {
      return NextResponse.json({ status: 'error', message: 'No eres el estudiante de esta tutoría' }, { status: 403 });
    }
    if (tutoria.estado !== 'COMPLETADA') {
      return NextResponse.json({ status: 'error', message: 'Solo puedes reseñar tutorías completadas' }, { status: 400 });
    }

    const existente = await prisma.resena.findFirst({ where: { tutoriaId: tutoria_id } });
    if (existente) {
      return NextResponse.json({ status: 'error', message: 'Ya reseñaste esta tutoría' }, { status: 409 });
    }

    const resena = await prisma.resena.create({
      data: {
        tutoriaId: tutoria_id,
        calificacionEstrellas,
        feedback: feedback || null,
      }
    });

    const avg = await prisma.resena.aggregate({
      where: { tutoria: { tutorId: tutoria.tutorId } },
      _avg: { calificacionEstrellas: true }
    });

    await prisma.tutor.update({
      where: { usuarioId: tutoria.tutorId },
      data: { reputacionPromedio: avg._avg.calificacionEstrellas || 0 }
    });

    return NextResponse.json({ status: 'success', data: resena });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'error', message: 'Error al crear reseña' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ tutoria_id: string }> }) {
  try {
    const { tutoria_id } = await params;
    const resena = await prisma.resena.findFirst({
      where: { tutoriaId: tutoria_id },
      include: { tutoria: { select: { tutorId: true, estudianteId: true } } }
    });
    return NextResponse.json({ status: 'success', data: resena });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'error', message: 'Error al obtener reseña' }, { status: 500 });
  }
}

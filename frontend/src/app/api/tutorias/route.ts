import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { enviarNotificacion, generarMensajeReserva } from '@/lib/notificaciones';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'No autenticado' }, { status: 401 });
    }
    if (session.rol !== 'ESTUDIANTE') {
      return NextResponse.json({ status: 'error', message: 'Solo estudiantes pueden reservar' }, { status: 403 });
    }

    const { tutorId, materiaId, fechaInicio, fechaFin } = await req.json();

    if (!tutorId || !materiaId || !fechaInicio || !fechaFin) {
      return NextResponse.json({ status: 'error', message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin <= inicio) {
      return NextResponse.json({ status: 'error', message: 'La fecha fin debe ser posterior a la fecha inicio' }, { status: 400 });
    }

    const diaSemana = inicio.getDay();
    const horaInicioStr = inicio.toTimeString().slice(0, 5);
    const horaFinStr = fin.toTimeString().slice(0, 5);

    const disponibilidadesTutor = await prisma.disponibilidad.findMany({
      where: { tutorId }
    });

    if (disponibilidadesTutor.length > 0) {
      const tieneDisponibilidad = disponibilidadesTutor.some(d =>
        d.diaSemana === diaSemana &&
        d.horaInicio <= horaInicioStr &&
        d.horaFin >= horaFinStr
      );

      if (!tieneDisponibilidad) {
        return NextResponse.json({
          status: 'error',
          message: 'El tutor no tiene disponibilidad en ese horario. Revisa sus horarios disponibles.'
        }, { status: 400 });
      }
    }

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
      return NextResponse.json({ status: 'error', message: 'El tutor ya tiene una tutoría en ese horario' }, { status: 409 });
    }

    const tutoria = await prisma.tutoria.create({
      data: {
        estudianteId: session.id,
        tutorId,
        materiaId,
        fechaInicio: inicio,
        fechaFin: fin,
        estado: 'PENDIENTE',
        modalidad: 'VIRTUAL',
      },
      include: {
        tutor: { include: { usuario: true } },
        materia: true,
      }
    });

    await enviarNotificacion('email', {
      destino: tutoria.tutor.usuario.email,
      asunto: 'Nueva solicitud de tutoría',
      mensaje: generarMensajeReserva(
        session.nombreCompleto,
        tutoria.tutor.usuario.nombreCompleto,
        tutoria.materia.nombre,
        inicio
      ),
    });

    return NextResponse.json({ status: 'success', data: tutoria });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'error', message: 'Error al crear tutoría' }, { status: 500 });
  }
}

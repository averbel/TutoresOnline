import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { enviarNotificacion, generarMensajeConfirmacion } from '@/lib/notificaciones';

export async function PUT(req: Request, { params }: { params: Promise<{ tutoria_id: string }> }) {
    try {
        const { tutoria_id } = await params;
        const { estado } = await req.json();

        if (!['ACEPTADA', 'RECHAZADA', 'COMPLETADA'].includes(estado)) {
            return NextResponse.json({ status: 'error', message: 'Estado inválido' }, { status: 400 });
        }

        let urlEncuentroGenerada = null;

        if (estado === 'ACEPTADA') {
            urlEncuentroGenerada = `https://meet.jit.si/TutoresOnLine-${tutoria_id}-${Date.now()}`;
        }

        const tutoriaActualizada = await prisma.tutoria.update({
            where: { id: tutoria_id },
            data: { 
                estado,
                urlEncuentro: urlEncuentroGenerada
            },
            include: {
                estudiante: { include: { usuario: true } },
                tutor: { include: { usuario: true } },
                materia: true,
            }
        });

        if (estado === 'ACEPTADA' && urlEncuentroGenerada) {
            await enviarNotificacion('email', {
                destino: tutoriaActualizada.estudiante.usuario.email,
                asunto: 'Tutoría Confirmada',
                mensaje: generarMensajeConfirmacion(
                    tutoriaActualizada.tutor.usuario.nombreCompleto,
                    tutoriaActualizada.estudiante.usuario.nombreCompleto,
                    urlEncuentroGenerada,
                    tutoriaActualizada.fechaInicio
                ),
            });
        }

        return NextResponse.json({ status: 'success', data: tutoriaActualizada });
    } catch (error) {
        console.error("Error actualizando tutoría:", error);
        return NextResponse.json({ status: 'error', message: 'Error interno del servidor' }, { status: 500 });
    }
}

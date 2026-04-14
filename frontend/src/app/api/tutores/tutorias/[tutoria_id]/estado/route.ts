import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ tutoria_id: string }> }) {
    try {
        const { tutoria_id } = await params;
        const { estado } = await req.json();

        if (!['ACEPTADA', 'RECHAZADA'].includes(estado)) {
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
            }
        });

        return NextResponse.json({ status: 'success', data: tutoriaActualizada });
    } catch (error) {
        console.error("Error actualizando tutoría:", error);
        return NextResponse.json({ status: 'error', message: 'Error interno del servidor' }, { status: 500 });
    }
}

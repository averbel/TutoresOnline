import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const solicitudes = await prisma.tutoria.findMany({
            where: {
                tutorId: id,
                estado: {
                    in: ['PENDIENTE', 'ACEPTADA']
                }
            },
            include: {
                estudiante: {
                    include: { usuario: true }
                },
                materia: true
            },
            orderBy: {
                fechaInicio: 'asc'
            }
        });
        return NextResponse.json({ status: 'success', data: solicitudes });
    } catch (error) {
        console.error("Error obteniendo solicitudes:", error);
        return NextResponse.json({ status: 'error', message: 'Error interno del servidor' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const disponibilidades = await prisma.disponibilidad.findMany({
            where: { tutorId: id },
            orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }]
        });
        return NextResponse.json({ status: 'success', data: disponibilidades });
    } catch (error) {
        console.error("Error obteniendo disponibilidades:", error);
        return NextResponse.json({ status: 'error', message: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { disponibilidades } = await req.json();

        if (!Array.isArray(disponibilidades)) {
            return NextResponse.json({ status: 'error', message: 'El payload debe contener un array en la propiedad disponibilidades' }, { status: 400 });
        }

        await prisma.disponibilidad.deleteMany({
            where: { tutorId: id }
        });

        if (disponibilidades.length > 0) {
            await prisma.disponibilidad.createMany({
                data: disponibilidades.map((d: any) => ({
                    tutorId: id,
                    diaSemana: d.diaSemana,
                    horaInicio: d.horaInicio,
                    horaFin: d.horaFin
                }))
            });
        }

        const nuevasDisponibilidades = await prisma.disponibilidad.findMany({
            where: { tutorId: id },
            orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }]
        });

        return NextResponse.json({ status: 'success', data: nuevasDisponibilidades });
    } catch (error) {
        console.error("Error guardando disponibilidades:", error);
        return NextResponse.json({ status: 'error', message: 'Error interno del servidor' }, { status: 500 });
    }
}

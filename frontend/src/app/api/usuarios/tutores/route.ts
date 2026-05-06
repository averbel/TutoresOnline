import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const tutores = await prisma.tutor.findMany({
            include: {
                usuario: true,
                materias: {
                    include: { materia: true }
                }
            }
        });
        return NextResponse.json({ status: 'success', data: tutores });
    } catch (error: unknown) {
        console.error("Database connection error:", error instanceof Error ? error.message : String(error));
        return NextResponse.json({ 
            status: 'error', 
            message: 'Error interno conectando a la base de datos'
        }, { status: 500 });
    }
}

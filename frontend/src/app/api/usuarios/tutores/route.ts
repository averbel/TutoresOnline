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
        return NextResponse.json(tutores);
    } catch (error: any) {
        console.error("Database connection error:", error.message);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Error interno conectando a la base de datos'
        }, { status: 500 });
    }
}

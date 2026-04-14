import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { nombreCompleto, email, passwordHash, gradoAcademico } = await req.json();
        
        const nuevoEstudiante = await prisma.usuario.create({
            data: {
                nombreCompleto,
                email,
                passwordHash,
                rol: 'ESTUDIANTE',
                estudiante: {
                    create: { gradoAcademico }
                }
            },
            include: { estudiante: true }
        });

        return NextResponse.json({ status: 'success', data: nuevoEstudiante });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 'error', message: 'Posible email duplicado o formato inválido' }, { status: 400 });
    }
}

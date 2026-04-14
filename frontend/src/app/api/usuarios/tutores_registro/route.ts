import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { nombreCompleto, email, passwordHash, experiencia, especialidad } = await req.json();
        
        const biografiaPayload = JSON.stringify({
            experienciaAños: experiencia,
            especialidadPrincipal: especialidad
        });

        const nuevoTutor = await prisma.usuario.create({
            data: {
                nombreCompleto,
                email,
                passwordHash,
                rol: 'TUTOR',
                tutor: {
                    create: { 
                        biografia: biografiaPayload,
                        reputacionPromedio: 5.0
                    }
                }
            },
            include: { tutor: true }
        });

        return NextResponse.json({ status: 'success', data: nuevoTutor });
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') return NextResponse.json({ status: 'error', message: 'Correo corporativo ya registrado.' }, { status: 400 });
        return NextResponse.json({ status: 'error', message: 'Error interno o formato inválido' }, { status: 400 });
    }
}

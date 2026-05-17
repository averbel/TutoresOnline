import { hashSync } from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { registroTutorSchema } from '@/lib/schemas';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = registroTutorSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ status: 'error', message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { nombreCompleto, email, password, experiencia, especialidad, materias } = parsed.data;
        const passwordHash = hashSync(password, 10);
        
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
                        reputacionPromedio: 5.0,
                        materias: materias && materias.length > 0 ? {
                            create: materias.map(m => ({
                                materiaId: m.materiaId,
                                tarifaPorHora: m.tarifaPorHora,
                            }))
                        } : undefined,
                    }
                }
            },
            include: { tutor: true }
        });

        return NextResponse.json({ status: 'success', data: { id: nuevoTutor.id, nombreCompleto: nuevoTutor.nombreCompleto, email: nuevoTutor.email, rol: nuevoTutor.rol } });
    } catch (error: unknown) {
        console.error(error);
        const isDuplicate = typeof error === 'object' && error !== null && 'code' in error && (error as Record<string, unknown>).code === 'P2002';
        if (isDuplicate) return NextResponse.json({ status: 'error', message: 'Correo corporativo ya registrado.' }, { status: 400 });
        return NextResponse.json({ status: 'error', message: 'Error interno o formato inválido' }, { status: 400 });
    }
}

import { hashSync } from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { registroEstudianteSchema } from '@/lib/schemas';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = registroEstudianteSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ status: 'error', message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { nombreCompleto, email, password, gradoAcademico } = parsed.data;
        const passwordHash = hashSync(password, 10);
        
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

        return NextResponse.json({ status: 'success', data: { id: nuevoEstudiante.id, nombreCompleto: nuevoEstudiante.nombreCompleto, email: nuevoEstudiante.email, rol: nuevoEstudiante.rol } });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 'error', message: 'Posible email duplicado o formato inválido' }, { status: 400 });
    }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email, passwordHash } = await req.json();
        
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario || usuario.passwordHash !== passwordHash) {
            return NextResponse.json({ status: 'error', message: 'Credenciales incorrectas' }, { status: 401 });
        }

        const sesionData = {
            id: usuario.id,
            nombreCompleto: usuario.nombreCompleto,
            email: usuario.email,
            rol: usuario.rol
        };

        return NextResponse.json({ status: 'success', data: sesionData });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 'error', message: 'Falla al procesar el Login' }, { status: 500 });
    }
}

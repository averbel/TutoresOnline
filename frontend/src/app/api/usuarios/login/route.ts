import { compareSync } from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/schemas';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ status: 'error', message: parsed.error.issues[0].message }, { status: 400 });
        }

        const { email, password } = parsed.data;

        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario || !compareSync(password, usuario.passwordHash)) {
            return NextResponse.json({ status: 'error', message: 'Credenciales incorrectas' }, { status: 401 });
        }

        const sessionData = {
            id: usuario.id,
            nombreCompleto: usuario.nombreCompleto,
            email: usuario.email,
            rol: usuario.rol
        };

        const token = await signToken(sessionData);

        const response = NextResponse.json({ status: 'success', data: sessionData });
        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 días
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 'error', message: 'Falla al procesar el Login' }, { status: 500 });
    }
}

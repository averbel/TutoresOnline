import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const materia = url.searchParams.get('materia');
        const nivel = url.searchParams.get('nivel');
        const reputacionMin = url.searchParams.get('reputacionMin');
        const flash = url.searchParams.get('flash');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        if (flash === 'true') {
            where.activoAhoraFlash = true;
        }

        if (reputacionMin) {
            where.reputacionPromedio = { gte: parseFloat(reputacionMin) };
        }

        if (materia || nivel) {
            where.materias = {
                some: {
                    materia: {
                        ...(materia ? { nombre: { contains: materia, mode: 'insensitive' } } : {}),
                        ...(nivel ? { nivelEducativo: nivel } : {}),
                    }
                }
            };
        }

        const [tutores, total] = await Promise.all([
            prisma.tutor.findMany({
                where,
                include: {
                    usuario: true,
                    materias: { include: { materia: true } },
                    disponibilidades: true,
                },
                skip,
                take: limit,
                orderBy: { reputacionPromedio: 'desc' },
            }),
            prisma.tutor.count({ where }),
        ]);

        return NextResponse.json({
            status: 'success',
            data: tutores,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error: unknown) {
        console.error("Database connection error:", error instanceof Error ? error.message : String(error));
        return NextResponse.json({ 
            status: 'error', 
            message: 'Error interno conectando a la base de datos'
        }, { status: 500 });
    }
}

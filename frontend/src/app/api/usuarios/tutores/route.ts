import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

        const diaSemana = url.searchParams.get('diaSemana');
        const hora = url.searchParams.get('hora');
        const latStr = url.searchParams.get('lat');
        const lngStr = url.searchParams.get('lng');
        const distanciaMaxStr = url.searchParams.get('distanciaMax');

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

        if (diaSemana !== null && hora !== null) {
            where.disponibilidades = {
                some: {
                    diaSemana: parseInt(diaSemana!),
                    horaInicio: { lte: hora! },
                    horaFin: { gte: hora! },
                }
            };
        }

        let tutores = await prisma.tutor.findMany({
            where,
            include: {
                usuario: true,
                materias: { include: { materia: true } },
                disponibilidades: true,
            },
            skip,
            take: limit,
            orderBy: { reputacionPromedio: 'desc' },
        });

        const total = await prisma.tutor.count({ where });

        if (latStr && lngStr && distanciaMaxStr) {
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);
            const distanciaMax = parseFloat(distanciaMaxStr);
            tutores = tutores.filter(t => {
                if (t.latitud == null || t.longitud == null) return false;
                return haversineDistance(lat, lng, t.latitud, t.longitud) <= distanciaMax;
            });
        }

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

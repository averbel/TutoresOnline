import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resenas = await prisma.resena.findMany({
      where: { tutoria: { tutorId: id } },
      include: {
        tutoria: {
          select: {
            estudiante: { select: { usuario: { select: { nombreCompleto: true } } } },
            materia: { select: { nombre: true } },
          }
        }
      },
      orderBy: { id: 'desc' }
    });
    return NextResponse.json({ status: 'success', data: resenas });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'error', message: 'Error al obtener reseñas' }, { status: 500 });
  }
}

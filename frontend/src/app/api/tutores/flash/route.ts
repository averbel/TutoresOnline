import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.rol !== 'TUTOR') {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 403 });
    }

    const { activo } = await req.json();

    const tutor = await prisma.tutor.update({
      where: { usuarioId: session.id },
      data: { activoAhoraFlash: !!activo }
    });

    return NextResponse.json({ status: 'success', data: { activoAhoraFlash: tutor.activoAhoraFlash } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'error', message: 'Error al actualizar modo flash' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tutores = await prisma.tutor.findMany({
      where: { activoAhoraFlash: true },
      include: {
        usuario: true,
        materias: { include: { materia: true } }
      }
    });
    return NextResponse.json({ status: 'success', data: tutores });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'error', message: 'Error al listar tutores flash' }, { status: 500 });
  }
}

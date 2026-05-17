import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const materias = await prisma.materia.findMany({ orderBy: { nombre: 'asc' } });
    return NextResponse.json({ status: 'success', data: materias });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'error', message: 'Error al listar materias' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nombre, nivelEducativo } = await req.json();
    if (!nombre || !nivelEducativo) {
      return NextResponse.json({ status: 'error', message: 'nombre y nivelEducativo requeridos' }, { status: 400 });
    }
    const materia = await prisma.materia.create({ data: { nombre, nivelEducativo } });
    return NextResponse.json({ status: 'success', data: materia });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'error', message: 'Error al crear materia' }, { status: 500 });
  }
}

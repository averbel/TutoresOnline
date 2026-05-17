import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const pool = new Pool({
  connectionString: 'postgresql://postgres.aadfrmhsazyaftyrsrwv:rN6vr7w872oKQrpw@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const materias = [
    { nombre: 'Matemáticas', nivelEducativo: 'Universidad' },
    { nombre: 'Álgebra', nivelEducativo: 'Secundaria' },
    { nombre: 'Geometría', nivelEducativo: 'Secundaria' },
    { nombre: 'Cálculo I', nivelEducativo: 'Universidad' },
    { nombre: 'Cálculo II', nivelEducativo: 'Universidad' },
    { nombre: 'Física', nivelEducativo: 'Universidad' },
    { nombre: 'Química', nivelEducativo: 'Universidad' },
    { nombre: 'Biología', nivelEducativo: 'Secundaria' },
    { nombre: 'Inglés Básico', nivelEducativo: 'Primaria' },
    { nombre: 'Inglés Avanzado', nivelEducativo: 'Universidad' },
    { nombre: 'Programación', nivelEducativo: 'Universidad' },
    { nombre: 'Historia', nivelEducativo: 'Secundaria' },
    { nombre: 'Literatura', nivelEducativo: 'Secundaria' },
    { nombre: 'Filosofía', nivelEducativo: 'Universidad' },
    { nombre: 'Economía', nivelEducativo: 'Universidad' },
    { nombre: 'Arte', nivelEducativo: 'Primaria' },
    { nombre: 'Música', nivelEducativo: 'Primaria' },
    { nombre: 'Lectura', nivelEducativo: 'Primaria' },
    { nombre: 'Ciencias Naturales', nivelEducativo: 'Primaria' },
    { nombre: 'Geografía', nivelEducativo: 'Primaria' },
  ];

  for (const m of materias) {
    await prisma.materia.upsert({
      where: { id: m.nombre },
      update: {},
      create: { id: m.nombre, nombre: m.nombre, nivelEducativo: m.nivelEducativo },
    });
  }

  const password = hashSync('123456', 10);

  const tutores = [
    { nombreCompleto: 'Carlos Mendoza', email: 'carlos@test.com', especialidad: 'Matemáticas', pais: 'Perú', lat: -12.0464, lng: -77.0428 },
    { nombreCompleto: 'Ana López', email: 'ana@test.com', especialidad: 'Inglés Avanzado', pais: 'México', lat: 19.4326, lng: -99.1332 },
    { nombreCompleto: 'Luis García', email: 'luis@test.com', especialidad: 'Programación', pais: 'Colombia', lat: 4.7110, lng: -74.0721 },
    { nombreCompleto: 'María Torres', email: 'maria@test.com', especialidad: 'Física', pais: 'Argentina', lat: -34.6037, lng: -58.3816 },
    { nombreCompleto: 'Pedro Sánchez', email: 'pedro@test.com', especialidad: 'Química', pais: 'Chile', lat: -33.4489, lng: -70.6693 },
  ];

  for (const t of tutores) {
    const usuario = await prisma.usuario.upsert({
      where: { email: t.email },
      update: {},
      create: {
        nombreCompleto: t.nombreCompleto,
        email: t.email,
        passwordHash: password,
        rol: 'TUTOR',
        tutor: {
          create: {
            biografia: JSON.stringify({ especialidadPrincipal: t.especialidad, paisOrigen: t.pais }),
            latitud: t.lat,
            longitud: t.lng,
            reputacionPromedio: 4.5 + Math.random() * 0.5,
          }
        }
      },
      include: { tutor: true }
    });

    const materia = await prisma.materia.findFirst({ where: { nombre: t.especialidad } });
    if (materia && usuario.tutor) {
      await prisma.tutorMateria.upsert({
        where: { tutorId_materiaId: { tutorId: usuario.tutor.usuarioId, materiaId: materia.id } },
        update: {},
        create: { tutorId: usuario.tutor.usuarioId, materiaId: materia.id, tarifaPorHora: 40 + Math.random() * 60 },
      });
    }
  }

  const estudiante = await prisma.usuario.upsert({
    where: { email: 'estudiante@test.com' },
    update: {},
    create: {
      nombreCompleto: 'Estudiante Demo',
      email: 'estudiante@test.com',
      passwordHash: password,
      rol: 'ESTUDIANTE',
      estudiante: { create: { gradoAcademico: 'Universidad' } }
    }
  });

  console.log('Seed completado exitosamente');
  console.log('Tutores demo: carlos@test.com, ana@test.com, luis@test.com / pass: 123456');
  console.log('Estudiante demo: estudiante@test.com / pass: 123456');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

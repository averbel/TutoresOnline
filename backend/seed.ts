import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const mockTutors = [
  { nombre: 'Carlos M.', email: 'carlos@mock.com', mat: 'Matemáticas y Física', tarifa: 60, pais: 'Perú', rep: 5.0 },
  { nombre: 'Ana G.', email: 'ana@mock.com', mat: 'Inglés Avanzado', tarifa: 50, pais: 'Colombia', rep: 4.9 },
  { nombre: 'Luis R.', email: 'luis@mock.com', mat: 'Programación Web', tarifa: 70, pais: 'México', rep: 5.0 },
  { nombre: 'Sofía T.', email: 'sofia@mock.com', mat: 'Biología Celular', tarifa: 45, pais: 'Argentina', rep: 4.8 },
  { nombre: 'Diego H.', email: 'diego@mock.com', mat: 'Historia Universal', tarifa: 40, pais: 'España', rep: 4.7 },
  { nombre: 'Valentina P.', email: 'valentina@mock.com', mat: 'Química Orgánica', tarifa: 55, pais: 'Chile', rep: 4.9 },
  { nombre: 'Ricardo F.', email: 'ricardo@mock.com', mat: 'Marketing Digital', tarifa: 65, pais: 'Perú', rep: 5.0 },
  { nombre: 'Marta L.', email: 'marta@mock.com', mat: 'Francés Básico', tarifa: 50, pais: 'Colombia', rep: 4.6 },
  { nombre: 'Andrés V.', email: 'andres@mock.com', mat: 'Física Cuántica', tarifa: 80, pais: 'México', rep: 5.0 },
  { nombre: 'Camila C.', email: 'camila@mock.com', mat: 'Arte y Diseño', tarifa: 45, pais: 'España', rep: 4.9 },
  { nombre: 'Javier N.', email: 'javier@mock.com', mat: 'Matemáticas Financieras', tarifa: 60, pais: 'Argentina', rep: 4.5 },
  { nombre: 'Lorena M.', email: 'lorena@mock.com', mat: 'Liderazgo Empresarial', tarifa: 75, pais: 'Chile', rep: 4.8 },
  { nombre: 'Pedro S.', email: 'pedro@mock.com', mat: 'Ciberseguridad', tarifa: 90, pais: 'Perú', rep: 5.0 }
];

async function main() {
    console.log("Borrando inventario y bases masivas previas...");
    await prisma.tutorMateria.deleteMany();
    await prisma.materia.deleteMany();

    console.log("Integrando 13 Tutores con Países Mapeados... esto tomará unos segundos.");
    
    for (const data of mockTutors) {
        let mat = await prisma.materia.findFirst({ where: { nombre: data.mat }});
        if (!mat) {
             mat = await prisma.materia.create({ data: { nombre: data.mat, nivelEducativo: 'Todos' } });
        }

        const payload = JSON.stringify({ paisOrigen: data.pais, experienciaAños: Math.floor(Math.random() * 10) + 2 });

        const u = await prisma.usuario.upsert({
           where: { email: data.email }, update: {},
           create: { 
             nombreCompleto: data.nombre, email: data.email, passwordHash: '123', rol: 'TUTOR', 
             tutor: { create: { reputacionPromedio: data.rep, biografia: payload } } 
           }
        });

        await prisma.tutorMateria.create({ data: { tutorId: u.id, materiaId: mat.id, tarifaPorHora: data.tarifa } });
    }

    console.log("Seed Masivo y Geográfico Completado!!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

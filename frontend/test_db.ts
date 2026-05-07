import "dotenv/config";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const usuarios = await prisma.usuario.findMany();
        console.log("Usuarios en la base de datos:", usuarios.length);
        if (usuarios.length > 0) {
            console.log("Primer usuario:", usuarios[0]);
        }
    } catch (e) {
        console.error("Error conectando a BD:", e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());

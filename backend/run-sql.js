const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Leemos como utf16le porque Windows usa esa codificacion en redirecciones >
  const sqlRaw = fs.readFileSync('setup.sql', 'utf16le');

  // Limpiamos la query completa
  const sql = sqlRaw.replace(/^\uFEFF/, '').trim();

  // Lo enviamos a Supabase
  await client.query(sql);
  console.log("¡Tablas creadas en Supabase exitosamente!");

  await client.end();
}
run().catch(console.error);

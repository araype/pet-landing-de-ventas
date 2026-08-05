import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

let cached: Db | null = null;

function getDb(): Db {
  if (cached) return cached;

  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL (o POSTGRES_URL) — conecta la base de datos de Postgres del proyecto en Vercel."
    );
  }

  const sql = neon(connectionString);
  cached = drizzle(sql, { schema });
  return cached;
}

// Proxy: la conexión solo se crea (y solo entonces exige DATABASE_URL) la
// primera vez que se usa `db`, no al importar este módulo. Next.js importa
// este archivo al recolectar metadata de rutas en build, sin ejecutar ninguna
// consulta, así que el build no debe depender de tener la base ya conectada.
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});

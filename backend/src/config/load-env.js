import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Lokal ist die Root-.env die einzige Konfigurationsquelle. Im Container gibt
// es diese Datei bewusst nicht; dort stellt Docker Compose die Umgebung bereit.
dotenv.config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
  quiet: true
});

// Lokal wird die Verbindungs-URL aus denselben PostgreSQL-Werten aufgebaut,
// die auch Compose verwendet. Eine explizite DATABASE_URL hat Vorrang.
if (!process.env.DATABASE_URL && process.env.POSTGRES_PASSWORD) {
  const user = encodeURIComponent(process.env.POSTGRES_USER || "licensing");
  const password = encodeURIComponent(process.env.POSTGRES_PASSWORD);
  const host = process.env.POSTGRES_HOST || "localhost";
  const port = process.env.POSTGRES_PORT || "5432";
  const database = encodeURIComponent(process.env.POSTGRES_DB || "moebel_design_licensing");
  process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

import "./src/config/load-env.js";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://licensing:licensing@localhost:5432/moebel_design_licensing"
  }
});

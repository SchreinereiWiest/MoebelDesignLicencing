import "./config/load-env.js";
import { createApp } from "./app.js";
import { bootstrapApplication } from "./bootstrap.js";
import { loadEnvironment } from "./config/env.js";
import { disconnectDatabase, prisma } from "./lib/prisma.js";

const environment = loadEnvironment();

async function start() {
  await prisma.$connect();
  await bootstrapApplication(environment);
  const server = createApp(environment).listen(environment.port, () => {
    console.log(`MoebelDesignLicencing API läuft auf Port ${environment.port}`);
  });

  const shutdown = signal => {
    console.log(`${signal} empfangen, Server wird beendet`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch(async error => {
  console.error("Backend konnte nicht gestartet werden:", error);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});

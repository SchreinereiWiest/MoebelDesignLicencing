import { prisma } from "./lib/prisma.js";
import { hashPassword, hashToken, verifyPassword } from "./shared/crypto.js";

export async function bootstrapApplication(environment) {
  const existingAdmin = await prisma.admin.findUnique({ where: { email: environment.adminEmail } });
  const passwordHash = existingAdmin && await verifyPassword(environment.adminPassword, existingAdmin.passwordHash)
    ? existingAdmin.passwordHash
    : await hashPassword(environment.adminPassword);

  const admin = await prisma.admin.upsert({
    where: { email: environment.adminEmail },
    create: {
      email: environment.adminEmail,
      displayName: environment.adminName,
      passwordHash
    },
    update: {
      displayName: environment.adminName,
      passwordHash,
      isActive: true
    }
  });

  if (existingAdmin && existingAdmin.passwordHash !== passwordHash) {
    await prisma.adminSession.deleteMany({ where: { adminId: admin.id } });
  }

  await upsertApiClient(environment.clientName, environment.clientKey, ["carpenters-production"]);
  await upsertApiClient(environment.designSuiteClientName, environment.designSuiteClientKey, ["moebel-design-suite"]);

  await prisma.adminSession.deleteMany({ where: { expiresAt: { lte: new Date() } } });
}

async function upsertApiClient(name, key, products) {
  const tokenHash = hashToken(key);
  const tokenPrefix = key.slice(0, 10);
  const existingClient = await prisma.apiClient.findFirst({ where: { name } });
  if (existingClient) {
    await prisma.apiClient.update({
      where: { id: existingClient.id },
      data: { tokenHash, tokenPrefix, products, isActive: true }
    });
    return;
  }
  await prisma.apiClient.create({ data: { name, tokenHash, tokenPrefix, products } });
}

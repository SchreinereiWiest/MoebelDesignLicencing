import { prisma } from "../../lib/prisma.js";
import { hashToken, randomToken } from "../../shared/crypto.js";
import { HttpError } from "../../shared/http.js";
import {
  features,
  normalizedName,
  optionalDate,
  optionalInteger,
  status,
  text
} from "../../shared/validation.js";

const PRODUCT_ID = "carpenters-production";

const effectiveStatus = (license) =>
  license.status === "active" &&
  license.validUntil &&
  license.validUntil <= new Date()
    ? "expired"
    : license.status;

export const publicLicense = (license) => ({
  id: license.id,
  licenseId: license.licenseId,
  productId: license.productId,
  tenantId: license.tenantId,
  companyName: license.companyName,
  tenantSlug: license.tenantSlug,
  plan: license.plan,
  features: license.features,
  maxUsers: license.maxUsers,
  validUntil: license.validUntil,
  status: effectiveStatus(license),
  activationKeyHint: license.activationKeyHint,
  lastValidatedAt: license.lastValidatedAt,
  createdAt: license.createdAt,
  updatedAt: license.updatedAt
});

const licenseData = (body, { partial = false } = {}) => {
  const data = {};
  const assign = (field, parser) => {
    if (!partial || body[field] !== undefined)
      data[field] = parser(body[field]);
  };
  assign("companyName", (value) => text(value, "Firmenname"));
  assign("tenantId", (value) =>
    text(value, "Tenant-ID", { required: false, max: 100 })
  );
  assign("tenantSlug", (value) =>
    text(value, "Tenant-Slug", { required: false, max: 100 })
  );
  assign("plan", (value) => text(value, "Lizenzmodell", { max: 80 }));
  assign("features", (value) => features(value));
  assign("maxUsers", (value) => optionalInteger(value, "Benutzerlimit"));
  assign("validUntil", (value) => optionalDate(value, "Ablaufdatum"));
  assign("status", (value) => status(value ?? "active"));
  return data;
};

const translateUniqueError = (error) => {
  if (error?.code === "P2002") {
    throw new HttpError(
      409,
      "LICENSE_CONFLICT",
      "Tenant-ID oder Lizenzkennung ist bereits vergeben"
    );
  }
  throw error;
};

export async function createLicense(body, adminId) {
  const activationKey = `MDL_${randomToken(30)}`;
  try {
    const license = await prisma.license.create({
      data: {
        ...licenseData(body),
        licenseId: `lic_${randomToken(12)}`,
        productId: PRODUCT_ID,
        activationKeyHash: hashToken(activationKey),
        activationKeyHint: activationKey.slice(-8),
        auditEvents: { create: { action: "license.created", adminId } }
      }
    });
    return { license: publicLicense(license), activationKey };
  } catch (error) {
    translateUniqueError(error);
  }
}

export async function updateLicense(id, body, adminId) {
  try {
    const license = await prisma.license.update({
      where: { id },
      data: {
        ...licenseData(body, { partial: true }),
        auditEvents: { create: { action: "license.updated", adminId } }
      }
    });
    return publicLicense(license);
  } catch (error) {
    if (error?.code === "P2025")
      throw new HttpError(404, "LICENSE_NOT_FOUND", "Lizenz nicht gefunden");
    translateUniqueError(error);
  }
}

export async function deleteLicense(id, adminId) {
  const existing = await prisma.license.findUnique({ where: { id } });
  if (!existing)
    throw new HttpError(404, "LICENSE_NOT_FOUND", "Lizenz nicht gefunden");
  await prisma.$transaction([
    prisma.auditEvent.create({
      data: {
        action: "license.deleted",
        adminId,
        licenseId: id,
        details: {
          licenseId: existing.licenseId,
          companyName: existing.companyName
        }
      }
    }),
    prisma.license.delete({ where: { id } })
  ]);
}

export async function rotateActivationKey(id, adminId) {
  const activationKey = `MDL_${randomToken(30)}`;
  try {
    const license = await prisma.license.update({
      where: { id },
      data: {
        activationKeyHash: hashToken(activationKey),
        activationKeyHint: activationKey.slice(-8),
        auditEvents: {
          create: { action: "license.activation_key_rotated", adminId }
        }
      }
    });
    return { license: publicLicense(license), activationKey };
  } catch (error) {
    if (error?.code === "P2025")
      throw new HttpError(404, "LICENSE_NOT_FOUND", "Lizenz nicht gefunden");
    throw error;
  }
}

export async function listLicenses(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(query.pageSize, 10) || 25)
  );
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const now = new Date();
  const where = {
    ...(search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" } },
            { licenseId: { contains: search, mode: "insensitive" } },
            { tenantId: { contains: search, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(query.status === "expired"
      ? { status: "active", validUntil: { lte: now } }
      : query.status && query.status !== "all"
        ? { status: status(query.status) }
        : {})
  };
  const activeWhere = {
    status: "active",
    OR: [{ validUntil: null }, { validUntil: { gt: now } }]
  };
  const expiringAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [items, total, all, active, expiring, seatAggregate] =
    await prisma.$transaction([
      prisma.license.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.license.count({ where }),
      prisma.license.count(),
      prisma.license.count({ where: activeWhere }),
      prisma.license.count({
        where: { status: "active", validUntil: { gt: now, lte: expiringAt } }
      }),
      prisma.license.aggregate({ where: activeWhere, _sum: { maxUsers: true } })
    ]);

  return {
    items: items.map(publicLicense),
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.max(1, Math.ceil(total / pageSize))
    },
    summary: {
      total: all,
      active,
      expiring,
      inactive: all - active,
      licensedUsers: seatAggregate._sum.maxUsers ?? 0
    }
  };
}

function externalInput(body) {
  if (body?.apiVersion !== "1")
    throw new HttpError(
      400,
      "API_VERSION_UNSUPPORTED",
      "apiVersion 1 ist erforderlich"
    );
  const productId = text(body.productId, "productId", { max: 100 });
  if (productId !== PRODUCT_ID)
    throw new HttpError(404, "PRODUCT_NOT_FOUND", "Produkt nicht gefunden");
  const installation = body.installation;
  if (!installation || typeof installation !== "object")
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "installation ist erforderlich"
    );
  return {
    productId,
    tenantId: text(installation.tenantId, "installation.tenantId", {
      max: 100
    }),
    companyName: text(installation.companyName, "installation.companyName"),
    tenantSlug: text(installation.tenantSlug, "installation.tenantSlug", {
      required: false,
      max: 100
    })
  };
}

const externalLicense = (license) => {
  const result = publicLicense(license);
  return {
    licenseId: result.licenseId,
    tenantId: result.tenantId,
    companyName: result.companyName,
    status: result.status,
    plan: result.plan,
    features: result.features,
    maxUsers: result.maxUsers,
    validUntil: result.validUntil
  };
};

export async function validateExternalLicense(body, apiClientId) {
  const input = externalInput(body);
  const license = await prisma.license.findUnique({
    where: {
      productId_tenantId: {
        productId: input.productId,
        tenantId: input.tenantId
      }
    }
  });
  if (!license)
    throw new HttpError(
      404,
      "LICENSE_NOT_FOUND",
      "Keine Lizenz für diese Installation gefunden"
    );

  const updated = await prisma.license.update({
    where: { id: license.id },
    data: {
      lastValidatedAt: new Date(),
      auditEvents: { create: { action: "license.validated", apiClientId } }
    }
  });
  return externalLicense(updated);
}

export async function activateExternalLicense(body, apiClientId) {
  const input = externalInput(body);
  const licenseKey = text(body.licenseKey, "licenseKey", { max: 16_384 });
  const license = await prisma.license.findUnique({
    where: { activationKeyHash: hashToken(licenseKey) }
  });
  if (!license || license.productId !== input.productId) {
    throw new HttpError(
      422,
      "LICENSE_KEY_INVALID",
      "Lizenzschlüssel ist ungültig"
    );
  }
  if (
    normalizedName(license.companyName) !== normalizedName(input.companyName)
  ) {
    throw new HttpError(
      422,
      "LICENSE_COMPANY_MISMATCH",
      "Lizenzschlüssel gehört zu einem anderen Unternehmen"
    );
  }
  if (license.tenantId && license.tenantId !== input.tenantId) {
    throw new HttpError(
      409,
      "LICENSE_ALREADY_ASSIGNED",
      "Lizenz ist bereits einer anderen Installation zugeordnet"
    );
  }
  if (effectiveStatus(license) !== "active") {
    throw new HttpError(422, "LICENSE_INACTIVE", "Lizenz ist nicht aktiv");
  }

  const updated = await prisma.license.update({
    where: { id: license.id },
    data: {
      tenantId: input.tenantId,
      tenantSlug: input.tenantSlug,
      lastValidatedAt: new Date(),
      auditEvents: {
        create: {
          action: "license.activated",
          apiClientId,
          details: { tenantId: input.tenantId }
        }
      }
    }
  });
  return externalLicense(updated);
}

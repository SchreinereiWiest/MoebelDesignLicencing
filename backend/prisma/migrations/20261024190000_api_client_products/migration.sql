ALTER TABLE "api_clients" ADD COLUMN "products" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
UPDATE "api_clients" SET "products" = ARRAY['carpenters-production'];

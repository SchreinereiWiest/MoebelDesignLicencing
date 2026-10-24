ALTER TABLE "licenses"
ADD COLUMN "products" TEXT[] NOT NULL
DEFAULT ARRAY['carpenters-production', 'moebel-design-suite']::TEXT[];

UPDATE "licenses"
SET "products" = ARRAY['carpenters-production', 'moebel-design-suite']::TEXT[];

DROP INDEX IF EXISTS "licenses_product_id_tenant_id_key";

ALTER TABLE "licenses" DROP COLUMN "product_id";

CREATE UNIQUE INDEX "licenses_tenant_id_key" ON "licenses"("tenant_id");

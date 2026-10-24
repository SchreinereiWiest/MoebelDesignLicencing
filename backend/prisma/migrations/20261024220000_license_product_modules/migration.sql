ALTER TABLE "licenses"
ALTER COLUMN "products" SET DEFAULT ARRAY[]::TEXT[];

UPDATE "licenses"
SET "features" = ARRAY(
  SELECT DISTINCT CASE feature
    WHEN 'cabinet' THEN 'work-preparation'
    WHEN 'nesting' THEN 'work-preparation'
    WHEN 'storage' THEN 'work-preparation'
    WHEN 'time' THEN 'work-preparation'
    WHEN 'purchasing' THEN 'shop'
    WHEN 'management' THEN 'business-management'
    WHEN 'public-sharing' THEN 'public-content'
    WHEN 'design-suite' THEN 'moodboards'
    ELSE feature
  END
  FROM unnest("features") AS feature
);

UPDATE "licenses"
SET "features" = array_append("features", 'calculation')
WHERE 'business-management' = ANY("features")
  AND NOT ('calculation' = ANY("features"));

UPDATE "licenses"
SET "features" = array_append("features", 'public-content')
WHERE "plan" = 'enterprise'
  AND 'moebel-design-suite' = ANY("products")
  AND NOT ('public-content' = ANY("features"));

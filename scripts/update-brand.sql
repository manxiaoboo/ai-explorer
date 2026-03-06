-- Update all tool meta titles and descriptions from 'AI Explorer' to 'attooli'
UPDATE "Tool" SET 
  "metaTitle" = REPLACE("metaTitle", 'AI Explorer', 'attooli'),
  "metaDescription" = REPLACE("metaDescription", 'AI Explorer', 'attooli')
WHERE "metaTitle" LIKE '%AI Explorer%' OR "metaDescription" LIKE '%AI Explorer%';

-- Update all news meta titles and descriptions
UPDATE "News" SET 
  "metaTitle" = REPLACE("metaTitle", 'AI Explorer', 'attooli'),
  "metaDescription" = REPLACE("metaDescription", 'AI Explorer', 'attooli')
WHERE "metaTitle" LIKE '%AI Explorer%' OR "metaDescription" LIKE '%AI Explorer%';

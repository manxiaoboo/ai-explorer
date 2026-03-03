-- Update database logo URLs to use Vercel Blob CDN
-- Run this SQL in your database console: https://console.neon.tech

-- Check current logos
SELECT id, name, logo FROM "Tool" WHERE logo IS NOT NULL;

-- Update logos to CDN URLs
UPDATE "Tool" SET logo = 'https://gyqld3z17j5o0ygm.private.blob.vercel-storage.com/logos/098f2c412563.png' 
WHERE logo LIKE '%098f2c412563.png';

UPDATE "Tool" SET logo = 'https://gyqld3z17j5o0ygm.private.blob.vercel-storage.com/logos/a964e7e2c2c4.png' 
WHERE logo LIKE '%a964e7e2c2c4.png';

UPDATE "Tool" SET logo = 'https://gyqld3z17j5o0ygm.private.blob.vercel-storage.com/logos/c53b7b9e56b3.png' 
WHERE logo LIKE '%c53b7b9e56b3.png';

UPDATE "Tool" SET logo = 'https://gyqld3z17j5o0ygm.private.blob.vercel-storage.com/logos/d7a27f2a25f1.png' 
WHERE logo LIKE '%d7a27f2a25f1.png';

UPDATE "Tool" SET logo = 'https://gyqld3z17j5o0ygm.private.blob.vercel-storage.com/logos/f5fee92a789f.png' 
WHERE logo LIKE '%f5fee92a789f.png';

-- Verify updates
SELECT id, name, logo FROM "Tool" WHERE logo LIKE '%vercel-storage.com%';

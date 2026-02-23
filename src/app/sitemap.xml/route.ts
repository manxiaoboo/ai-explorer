import { prisma } from "@/lib/db";

export async function GET() {
  const baseUrl = "https://aitools.example.com";

  const [tools, categories] = await Promise.all([
    prisma.tool.findMany({
      where: { isActive: true },
      select: { slug: true },
    }),
    prisma.category.findMany({
      select: { slug: true },
    }),
  ]);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/tools</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/free-ai-tools</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/trending</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${tools.map(tool => `
  <url>
    <loc>${baseUrl}/tools/${tool.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${categories.map(cat => `
  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

# Tooli

Find the perfect AI tool for your workflow. A high-performance AI tools directory built with Next.js 14, optimized for SEO and speed.

## Features

- 🔍 **SEO-First**: Structured data, sitemaps, meta tags, Open Graph
- ⚡ **Performance**: Edge deployment, ISR, image optimization
- 📊 **Data-Driven**: Trending scores, price tracking, GitHub stars
- 🎨 **Modern UI**: Tailwind CSS, responsive design
- 🌍 **Multi-language Ready**: i18n structure prepared

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma
- **Styling**: Tailwind CSS
- **Deployment**: Vercel / Cloudflare Pages
- **Search**: Algolia / Meilisearch

## Getting Started

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Run development server
npm run dev
```

## SEO Features

- Dynamic meta tags for each page
- JSON-LD structured data
- XML sitemaps (static + dynamic)
- Canonical URLs
- Open Graph / Twitter Cards
- Semantic HTML

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── page.tsx      # Homepage
│   ├── tools/        # Tool detail pages
│   ├── category/     # Category pages
│   └── api/          # API routes
├── components/       # React components
├── lib/             # Utilities
└── styles/          # Global styles
```

## License

MIT

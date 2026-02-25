// Tool logos as simple SVG data URLs
// These are embedded directly in the source code for now
// Can be moved to CDN later

export const toolLogos: Record<string, string> = {
  // Default placeholder - gradient circle with initial
  default: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:%23f97316"/>
          <stop offset="100%" style="stop-color:%23fbbf24"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(%23g)"/>
      <text x="50" y="65" font-size="50" text-anchor="middle" fill="white" font-family="Arial">T</text>
    </svg>
  `)}`,
  
  // GitHub
  github: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%23181717"/>
      <path fill="white" d="M50 20c-16.5 0-30 13.5-30 30 0 13.3 8.6 24.5 20.5 28.5 1.5.3 2-.7 2-1.5v-5.2c-8.3 1.8-10-3.5-10-3.5-1.4-3.5-3.3-4.5-3.3-4.5-2.7-1.8.2-1.8.2-1.8 3 .2 4.6 3.1 4.6 3.1 2.7 4.6 7 3.3 8.7 2.5.3-2 1-3.3 1.8-4-6.6-.8-13.5-3.3-13.5-14.7 0-3.2 1.2-5.9 3.1-8-.3-.8-1.3-3.7.3-7.8 0 0 2.5-.8 8.3 3.1 2.4-.7 5-.9 7.5-.9s5.1.3 7.5.9c5.8-3.9 8.3-3.1 8.3-3.1 1.6 4.1.6 7 .3 7.8 1.9 2.1 3.1 4.8 3.1 8 0 11.4-6.9 13.9-13.5 14.7 1.1.9 2 2.7 2 5.5v8.2c0 .8.5 1.8 2 1.5 11.9-4 20.5-15.2 20.5-28.5 0-16.5-13.5-30-30-30z"/>
    </svg>
  `)}`,
  
  // OpenAI
  openai: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%2310a37f"/>
      <path fill="white" d="M50 25c-13.8 0-25 11.2-25 25s11.2 25 25 25 25-11.2 25-25-11.2-25-25-25zm0 45c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"/>
    </svg>
  `)}`,
  
  // Anthropic
  anthropic: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%23d97757"/>
      <path fill="white" d="M35 30h10l15 40h-10l-3.5-10h-13l-3.5 10h-10l15-40zm5 8l-4 12h8l-4-12z"/>
    </svg>
  `)}`,
};

// Get logo for a tool
export function getToolLogo(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, '-');
  return toolLogos[key] || toolLogos.default;
}

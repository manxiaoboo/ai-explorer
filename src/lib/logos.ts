// Tool logos as simple SVG data URLs
// These are embedded directly in the source code for now
// Can be moved to CDN later

// Brand colors for major AI tools
const brandColors: Record<string, string> = {
  // Chat/LLM
  'chatgpt': '#10a37f',      // OpenAI green
  'openai': '#10a37f',
  'gpt': '#10a37f',
  'claude': '#d97757',       // Anthropic orange
  'anthropic': '#d97757',
  'gemini': '#4285f4',       // Google blue
  'google': '#4285f4',
  'bard': '#4285f4',
  'perplexity': '#20b2aa',   // Teal
  'poe': '#7c3aed',          // Purple
  'huggingface': '#ffbd59',  // Yellow
  'hf': '#ffbd59',
  
  // Image
  'midjourney': '#000000',   // Black
  'dalle': '#10a37f',        // OpenAI
  'stablediffusion': '#ff6b6b', // Red/coral
  'sd': '#ff6b6b',
  'leonardo': '#6366f1',     // Indigo
  'ideogram': '#ec4899',     // Pink
  
  // Code
  'github': '#181717',       // GitHub black
  'copilot': '#181717',
  'cursor': '#000000',       // Black
  'tabnine': '#4f46e5',      // Indigo
  'replit': '#f26207',       // Orange
  'codeium': '#10b981',      // Emerald
  
  // Writing
  'jasper': '#6366f1',       // Indigo
  'copyai': '#3b82f6',       // Blue
  'notion': '#000000',       // Black
  'grammarly': '#15c39a',    // Green
  'writesonic': '#f59e0b',   // Amber
  
  // Video
  'runway': '#000000',       // Black
  'pika': '#ec4899',         // Pink
  'synthesia': '#6366f1',    // Indigo
  'heygen': '#f97316',       // Orange
  
  // Audio
  'elevenlabs': '#000000',   // Black
  'murf': '#8b5cf6',         // Violet
  'playht': '#10b981',       // Emerald
  
  // Productivity
  'canva': '#00c4cc',        // Cyan
  'figma': '#f24e1e',        // Red-orange
  'notionai': '#000000',
};

// Generate SVG for a tool
function generateLogo(name: string, color: string): string {
  const initial = name.charAt(0).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="${color}"/&gt;
      <text x="50" y="68" font-size="50" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold"&gt;${initial}&lt;/text&gt;
    &lt;/svg&gt;
  `)}`;
}

// Pre-defined logos with custom SVGs
export const toolLogos: Record<string, string> = {
  // Default placeholder
  default: generateLogo('Tool', '#f97316'),
  
  // GitHub
  github: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%23181717"/&gt;
      <path fill="white" d="M50 20c-16.5 0-30 13.5-30 30 0 13.3 8.6 24.5 20.5 28.5 1.5.3 2-.7 2-1.5v-5.2c-8.3 1.8-10-3.5-10-3.5-1.4-3.5-3.3-4.5-3.3-4.5-2.7-1.8.2-1.8.2-1.8 3 .2 4.6 3.1 4.6 3.1 2.7 4.6 7 3.3 8.7 2.5.3-2 1-3.3 1.8-4-6.6-.8-13.5-3.3-13.5-14.7 0-3.2 1.2-5.9 3.1-8-.3-.8-1.3-3.7.3-7.8 0 0 2.5-.8 8.3 3.1 2.4-.7 5-.9 7.5-.9s5.1.3 7.5.9c5.8-3.9 8.3-3.1 8.3-3.1 1.6 4.1.6 7 .3 7.8 1.9 2.1 3.1 4.8 3.1 8 0 11.4-6.9 13.9-13.5 14.7 1.1.9 2 2.7 2 5.5v8.2c0 .8.5 1.8 2 1.5 11.9-4 20.5-15.2 20.5-28.5 0-16.5-13.5-30-30-30z"/&gt;
    </svg&gt;
  `)}`,
  
  // OpenAI
  openai: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%2310a37f"/&gt;
      <path fill="white" d="M50 25c-13.8 0-25 11.2-25 25s11.2 25 25 25 25-11.2 25-25-11.2-25-25-25zm0 45c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"/&gt;
    </svg&gt;
  `)}`,
  
  // Anthropic/Claude
  anthropic: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%23d97757"/&gt;
      <path fill="white" d="M35 30h10l15 40h-10l-3.5-10h-13l-3.5 10h-10l15-40zm5 8l-4 12h8l-4-12z"/&gt;
    </svg&gt;
  `)}`,
  
  // Google/Gemini
  google: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%234285f4"/&gt;
      <path fill="white" d="M50 25c-13.8 0-25 11.2-25 25s11.2 25 25 25c7 0 13.5-2.5 18-7.5l-6-5c-3 3-7 4.5-12 4.5-9 0-16-7-16-17s7-17 16-17c5 0 9 1.5 12 4.5l6-5c-4.5-5-11-7.5-18-7.5z"/&gt;
    </svg&gt;
  `)}`,
  
  // Midjourney
  midjourney: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%23000000"/&gt;
      <path fill="white" d="M30 35h8v30h-8zm16-10h8v40h-8zm16 10h8v30h-8z"/&gt;
    </svg&gt;
  `)}`,
  
  // Notion
  notion: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%23000000"/&gt;
      <path fill="white" d="M35 30h30l-5 40h-20z"/&gt;
    </svg&gt;
  `)}`,
  
  // Figma
  figma: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%23f24e1e"/&gt;
      <circle cx="40" cy="35" r="10" fill="white"/&gt;
      <circle cx="60" cy="35" r="10" fill="white"/&gt;
      <circle cx="40" cy="55" r="10" fill="white"/&gt;
      <circle cx="40" cy="75" r="10" fill="white"/&gt;
    </svg&gt;
  `)}`,
  
  // Canva
  canva: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="%2300c4cc"/&gt;
      <text x="50" y="65" font-size="45" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold"&gt;C&lt;/text&gt;
    </svg&gt;
  `)}`,
};

// Get logo for a tool
export function getToolLogo(name: string): string {
  const lowerName = name.toLowerCase();
  
  // Check for specific tools with custom logos
  if (lowerName.includes('github') || lowerName.includes('copilot')) {
    return toolLogos.github;
  }
  if (lowerName.includes('openai') || lowerName.includes('chatgpt') || lowerName === 'gpt') {
    return toolLogos.openai;
  }
  if (lowerName.includes('anthropic') || lowerName.includes('claude')) {
    return toolLogos.anthropic;
  }
  if (lowerName.includes('google') || lowerName.includes('gemini') || lowerName.includes('bard')) {
    return toolLogos.google;
  }
  if (lowerName.includes('midjourney') || lowerName.includes('mj')) {
    return toolLogos.midjourney;
  }
  if (lowerName.includes('notion')) {
    return toolLogos.notion;
  }
  if (lowerName.includes('figma')) {
    return toolLogos.figma;
  }
  if (lowerName.includes('canva')) {
    return toolLogos.canva;
  }
  
  // Generate logo from brand color
  for (const [keyword, color] of Object.entries(brandColors)) {
    if (lowerName.includes(keyword)) {
      return generateLogo(name, color);
    }
  }
  
  // Fallback to default
  return toolLogos.default;
}

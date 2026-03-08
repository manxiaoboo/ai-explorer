// Test HTML to Markdown conversion
const testHtml = `
<article>
  <h1>OpenAI Announces GPT-5</h1>
  <p>This is a <strong>major</strong> announcement about <em>AI</em>.</p>
  <h2>Key Features</h2>
  <ul>
    <li>Better reasoning</li>
    <li>Multimodal support</li>
  </ul>
  <img src="/image.png" alt="GPT-5 demo" />
  <p>Read more <a href="/blog">here</a>.</p>
  <table>
    <tr><th>Model</th><th>Params</th></tr>
    <tr><td>GPT-4</td><td>1.7T</td></tr>
  </table>
</article>
`;

// Convert HTML to Markdown preserving structure
function htmlToMarkdown(html: string, baseUrl: string): string {
  if (!html) return '';
  
  let processed = html
    // Remove script and style tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract images with markdown format
  processed = processed.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
    const altMatch = match.match(/alt=["']([^"]*)["']/i);
    const alt = altMatch ? altMatch[1] : '';
    // Make relative URLs absolute
    let fullUrl = src;
    if (src.startsWith('/')) {
      const base = new URL(baseUrl);
      fullUrl = `${base.protocol}//${base.host}${src}`;
    } else if (!src.startsWith('http')) {
      try {
        fullUrl = new URL(src, baseUrl).href;
      } catch {}
    }
    return alt ? `\n\n![${alt}](${fullUrl})\n\n` : `\n\n![](${fullUrl})\n\n`;
  });
  
  // Convert HTML to Markdown
  return processed
    // Headers
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n')
    
    // Bold and italic
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**')
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*')
    
    // Code blocks
    .replace(/<pre[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi, '\n\n```\n$1\n```\n\n')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    
    // Blockquotes
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n\n> $1\n\n')
    
    // Lists - unordered
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      return '\n\n' + items.map((item: string) => {
        const text = item.replace(/<li[^>]*>|<\/li>/gi, '').trim();
        return '* ' + text;
      }).join('\n') + '\n\n';
    })
    
    // Lists - ordered
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      let counter = 1;
      return '\n\n' + items.map((item: string) => {
        const text = item.replace(/<li[^>]*>|<\/li>/gi, '').trim();
        return `${counter++}. ` + text;
      }).join('\n') + '\n\n';
    })
    
    // Links
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, href, text) => {
      let fullUrl = href;
      if (!href.startsWith('http')) {
        try {
          fullUrl = new URL(href, baseUrl).href;
        } catch {}
      }
      return `[${text.trim()}](${fullUrl})`;
    })
    
    // Tables - convert to placeholder
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, '\n\n*[Table: See original article for data]*\n\n')
    
    // Line breaks and paragraphs
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n')
    .replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '\n\n$1\n\n')
    
    // Remove remaining tags
    .replace(/<[^>]+>/g, ' ')
    
    // Clean up whitespace
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

console.log('🧪 Testing HTML to Markdown conversion\n');
console.log('━'.repeat(60));
console.log('Input HTML:');
console.log(testHtml.substring(0, 300) + '...');
console.log('━'.repeat(60));
console.log('\nOutput Markdown:');
console.log('━'.repeat(60));
const result = htmlToMarkdown(testHtml, 'https://openai.com/blog');
console.log(result);
console.log('━'.repeat(60));
console.log('\n✅ Conversion complete!');
console.log(`   Length: ${result.length} chars`);
console.log(`   Has headers: ${result.includes('#')}`);
console.log(`   Has images: ${result.includes('![')}`);
console.log(`   Has lists: ${result.includes('* ')}`);
console.log(`   Has links: ${result.includes('](')}`);
console.log(`   Has tables: ${result.includes('Table:')}`);

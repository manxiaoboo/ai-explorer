/**
 * Update GitHub stars for all tools
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

async function updateGitHubStars() {
  const tools = await prisma.tool.findMany({
    where: {
      website: {
        contains: 'github.com'
      },
      isActive: true
    },
    take: 100 // Batch size
  });
  
  console.log(`Updating ${tools.length} tools...`);
  
  for (const tool of tools) {
    try {
      // Extract owner/repo from GitHub URL
      const match = tool.website.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) continue;
      
      const [, owner, repo] = match;
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Tooli-Updater/1.0'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Repository not found: ${tool.name}`);
        } else {
          console.error(`API error for ${tool.name}: ${response.status}`);
        }
        continue;
      }
      
      const data = await response.json();
      
      await prisma.tool.update({
        where: { id: tool.id },
        data: { 
          githubStars: data.stargazers_count,
          updatedAt: new Date()
        }
      });
      
      console.log(`✓ ${tool.name}: ${data.stargazers_count} stars`);
      
      // Rate limiting: max 5000 requests/hour for authenticated users
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error updating ${tool.name}:`, error);
    }
  }
}

updateGitHubStars()
  .then(() => {
    console.log('\nUpdate complete!');
    return prisma.$disconnect();
  })
  .catch(console.error);

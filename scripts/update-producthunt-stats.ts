/**
 * Product Hunt Stats Updater
 * 
 * Fetches votes and reviews for tools with Product Hunt IDs.
 * Requires PRODUCT_HUNT_API_KEY environment variable.
 */

import { prisma } from "./lib/prisma";

interface PHPostInfo {
  votesCount: number;
  commentsCount: number;
  reviewsCount: number;
  reviewsRating: number;
}

async function fetchPHStats(postId: string): Promise<PHPostInfo | null> {
  try {
    const apiKey = process.env.PRODUCT_HUNT_API_KEY;
    if (!apiKey) {
      console.log("  PRODUCT_HUNT_API_KEY not set, skipping...");
      return null;
    }
    
    const response = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: `
          query GetPost($id: ID!) {
            post(id: $id) {
              votesCount
              commentsCount
              reviewsCount
              reviewsRating
            }
          }
        `,
        variables: { id: postId },
      }),
    });
    
    if (!response.ok) {
      console.log(`  PH API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.data?.post) {
      console.log(`  Post not found: ${postId}`);
      return null;
    }
    
    return {
      votesCount: data.data.post.votesCount,
      commentsCount: data.data.post.commentsCount,
      reviewsCount: data.data.post.reviewsCount,
      reviewsRating: data.data.post.reviewsRating,
    };
  } catch (error) {
    console.error(`  Failed to fetch PH stats:`, error);
    return null;
  }
}

async function updatePHStats() {
  console.log("🔥 Starting Product Hunt stats update...\n");
  
  if (!process.env.PRODUCT_HUNT_API_KEY) {
    console.log("⚠️ PRODUCT_HUNT_API_KEY not set. Set it to enable PH tracking.");
    console.log("Get your API key at: https://www.producthunt.com/v2/oauth/applications\n");
    return;
  }
  
  // Get tools with PH IDs
  const tools = await prisma.tool.findMany({
    where: {
      isActive: true,
      productHuntId: { not: null },
    },
  });
  
  console.log(`📊 Found ${tools.length} tools with Product Hunt IDs\n`);
  
  let updated = 0;
  let errors = 0;
  
  for (const tool of tools) {
    if (!tool.productHuntId) continue;
    
    console.log(`🔍 ${tool.name}`);
    
    const stats = await fetchPHStats(tool.productHuntId);
    
    if (!stats) {
      errors++;
      continue;
    }
    
    // Update tool
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        productHuntVotes: stats.votesCount,
      },
    });
    
    console.log(`  ⬆️ ${stats.votesCount} votes | 💬 ${stats.commentsCount} comments`);
    updated++;
    
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  
  console.log(`\n✅ Updated ${updated} tools`);
  if (errors > 0) console.log(`❌ ${errors} errors`);
}

// Run if executed directly
if (require.main === module) {
  updatePHStats()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to update PH stats:", error);
      process.exit(1);
    });
}

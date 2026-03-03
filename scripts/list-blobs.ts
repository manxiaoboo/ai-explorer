import { list, del } from '@vercel/blob';

async function listBlobs() {
  console.log('📋 Listing all blobs in Vercel Blob storage...\n');
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN is not set');
    process.exit(1);
  }
  
  try {
    const { blobs } = await list({ prefix: 'logos/' });
    
    console.log(`Found ${blobs.length} blobs:\n`);
    
    // Group by folder
    const folders = new Map<string, number>();
    for (const blob of blobs) {
      const folder = blob.pathname.split('/')[1] || 'root';
      folders.set(folder, (folders.get(folder) || 0) + 1);
    }
    
    for (const [folder, count] of folders) {
      console.log(`  ${folder}/: ${count} files`);
    }
    
    console.log(`\nTotal: ${blobs.length} files`);
    
    // Show first 10 files
    if (blobs.length > 0) {
      console.log('\nFirst 10 files:');
      blobs.slice(0, 10).forEach(b => console.log(`  - ${b.pathname}`));
    }
    
  } catch (error) {
    console.error('❌ Failed to list blobs:', error);
    process.exit(1);
  }
}

listBlobs();

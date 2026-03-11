import 'dotenv/config';
import { put } from '@vercel/blob';

async function main() {
  console.log('测试 public 上传...');
  console.log('Token存在:', !!process.env.BLOB_READ_WRITE_TOKEN);
  
  try {
    const blob = await put('test/public-test.txt', Buffer.from('Hello World'), {
      access: 'public',
    });
    console.log('✅ Public 上传成功!');
    console.log('URL:', blob.url);
  } catch (error: any) {
    console.log('❌ 上传失败:', error.message);
  }
}

main().catch(console.error);

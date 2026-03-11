import { NextResponse } from "next/server";
import { head } from "@vercel/blob";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      // Fallback to local favicon
      return NextResponse.json({ url: "/favicon.svg" });
    }

    // Get blob metadata including the URL
    const blob = await head("brand/favicon.svg", { 
      token,
    });
    
    if (!blob) {
      return NextResponse.json({ url: "/favicon.svg" });
    }

    // Return the blob URL (works for private blobs with token)
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Failed to get brand icon:", error);
    return NextResponse.json({ url: "/favicon.svg" });
  }
}

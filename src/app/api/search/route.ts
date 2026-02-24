import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!query || query.length < 2) {
    return NextResponse.json({ tools: [] });
  }

  try {
    const tools = await prisma.tool.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { tagline: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        category: true,
      },
      take: limit,
      orderBy: {
        trendingScore: "desc",
      },
    });

    return NextResponse.json({ tools });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ tools: [] }, { status: 500 });
  }
}

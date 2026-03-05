import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PricingTier } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'tagline', 'description', 'website', 'category', 'pricingTier', 'email'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate website URL
    let website = body.website;
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      website = 'https://' + website;
    }

    // Check for duplicate submissions (same website)
    const existingSubmission = await prisma.toolSubmission.findFirst({
      where: {
        website: {
          equals: website,
          mode: 'insensitive'
        },
        status: 'PENDING'
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "This tool has already been submitted and is pending review." },
        { status: 409 }
      );
    }

    // Create submission
    const submission = await prisma.toolSubmission.create({
      data: {
        name: body.name.trim(),
        tagline: body.tagline.trim(),
        description: body.description.trim(),
        website: website,
        category: body.category,
        pricingTier: body.pricingTier as PricingTier,
        email: body.email.trim().toLowerCase(),
        status: 'PENDING'
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Tool submitted successfully! We'll review it within 48 hours.",
        submissionId: submission.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error submitting tool:", error);
    return NextResponse.json(
      { error: "Failed to submit tool. Please try again later." },
      { status: 500 }
    );
  }
}

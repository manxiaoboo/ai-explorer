import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ToolSubmissionStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Validate status
    const validStatuses: ToolSubmissionStatus[] = ["PENDING", "REVIEWED", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update submission
    const submission = await prisma.toolSubmission.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined,
        reviewedAt: status !== "PENDING" ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

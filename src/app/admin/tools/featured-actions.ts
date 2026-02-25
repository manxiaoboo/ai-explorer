"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function toggleFeatured(formData: FormData) {
  const id = formData.get("id") as string;
  const currentStatus = formData.get("currentStatus") === "true";
  
  await prisma.tool.update({
    where: { id },
    data: { isFeatured: !currentStatus },
  });
  
  revalidatePath("/admin/tools");
  revalidatePath("/");
}

export async function updateFeaturedOrder(formData: FormData) {
  const id = formData.get("id") as string;
  const trendingScore = parseFloat(formData.get("trendingScore") as string);
  
  await prisma.tool.update({
    where: { id },
    data: { trendingScore },
  });
  
  revalidatePath("/admin/tools");
  revalidatePath("/");
}

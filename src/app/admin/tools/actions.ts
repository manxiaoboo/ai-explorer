"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PricingTier } from "@prisma/client";

export async function deleteTool(formData: FormData) {
  const id = formData.get("id") as string;
  
  await prisma.tool.delete({
    where: { id },
  });
  
  revalidatePath("/admin/tools");
  revalidatePath("/");
  revalidatePath("/tools");
}

export async function createTool(formData: FormData) {
  const data = {
    slug: formData.get("slug") as string,
    name: formData.get("name") as string,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    website: formData.get("website") as string,
    categoryId: formData.get("categoryId") as string,
    pricingTier: formData.get("pricingTier") as PricingTier,
    priceStart: formData.get("priceStart") ? parseFloat(formData.get("priceStart") as string) : null,
    hasFreeTier: formData.get("hasFreeTier") === "on",
    hasTrial: formData.get("hasTrial") === "on",
    features: (formData.get("features") as string).split("\n").filter(Boolean),
    useCases: (formData.get("useCases") as string).split("\n").filter(Boolean),
    githubStars: formData.get("githubStars") ? parseInt(formData.get("githubStars") as string) : null,
    productHuntVotes: formData.get("productHuntVotes") ? parseInt(formData.get("productHuntVotes") as string) : null,
    trendingScore: parseFloat(formData.get("trendingScore") as string) || 50,
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
  };

  await prisma.tool.create({
    data,
  });

  revalidatePath("/admin/tools");
  revalidatePath("/");
  revalidatePath("/tools");
  redirect("/admin/tools");
}

export async function updateTool(formData: FormData) {
  const id = formData.get("id") as string;
  
  const data = {
    slug: formData.get("slug") as string,
    name: formData.get("name") as string,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    website: formData.get("website") as string,
    categoryId: formData.get("categoryId") as string,
    pricingTier: formData.get("pricingTier") as PricingTier,
    priceStart: formData.get("priceStart") ? parseFloat(formData.get("priceStart") as string) : null,
    hasFreeTier: formData.get("hasFreeTier") === "on",
    hasTrial: formData.get("hasTrial") === "on",
    features: (formData.get("features") as string).split("\n").filter(Boolean),
    useCases: (formData.get("useCases") as string).split("\n").filter(Boolean),
    githubStars: formData.get("githubStars") ? parseInt(formData.get("githubStars") as string) : null,
    productHuntVotes: formData.get("productHuntVotes") ? parseInt(formData.get("productHuntVotes") as string) : null,
    trendingScore: parseFloat(formData.get("trendingScore") as string) || 50,
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
  };

  await prisma.tool.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/tools");
  revalidatePath("/");
  revalidatePath("/tools");
  revalidatePath(`/tools/${data.slug}`);
  redirect("/admin/tools");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function deleteNews(formData: FormData) {
  const id = formData.get("id") as string;
  
  await prisma.news.delete({
    where: { id },
  });
  
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

export async function createNews(formData: FormData) {
  const publishedAt = formData.get("isPublished") === "on" 
    ? new Date() 
    : null;

  // Trim and normalize slug
  const rawSlug = formData.get("slug") as string;
  const slug = rawSlug.trim().toLowerCase().replace(/\s+/g, "-");

  const data = {
    slug,
    title: (formData.get("title") as string).trim(),
    excerpt: (formData.get("excerpt") as string).trim(),
    content: formData.get("content") as string,
    coverImage: (formData.get("coverImage") as string)?.trim() || null,
    metaTitle: (formData.get("metaTitle") as string)?.trim() || null,
    metaDescription: (formData.get("metaDescription") as string)?.trim() || null,
    isPublished: formData.get("isPublished") === "on",
    publishedAt,
  };

  await prisma.news.create({
    data,
  });

  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function updateNews(formData: FormData) {
  const id = formData.get("id") as string;
  
  const currentNews = await prisma.news.findUnique({
    where: { id },
  });

  const isPublished = formData.get("isPublished") === "on";
  
  // Only set publishedAt if transitioning from unpublished to published
  const publishedAt = !currentNews?.isPublished && isPublished
    ? new Date()
    : currentNews?.publishedAt;

  // Trim and normalize slug
  const rawSlug = formData.get("slug") as string;
  const slug = rawSlug.trim().toLowerCase().replace(/\s+/g, "-");

  const data = {
    slug,
    title: (formData.get("title") as string).trim(),
    excerpt: (formData.get("excerpt") as string).trim(),
    content: formData.get("content") as string,
    coverImage: (formData.get("coverImage") as string)?.trim() || null,
    metaTitle: (formData.get("metaTitle") as string)?.trim() || null,
    metaDescription: (formData.get("metaDescription") as string)?.trim() || null,
    isPublished,
    publishedAt,
  };

  await prisma.news.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath(`/news/${data.slug}`);
  redirect("/admin/news");
}

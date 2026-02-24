"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id") as string;
  
  await prisma.category.delete({
    where: { id },
  });
  
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function createCategory(formData: FormData) {
  const data = {
    slug: formData.get("slug") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    icon: formData.get("icon") as string,
    sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
  };

  await prisma.category.create({
    data,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  const id = formData.get("id") as string;
  
  const data = {
    slug: formData.get("slug") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    icon: formData.get("icon") as string,
    sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
  };

  await prisma.category.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

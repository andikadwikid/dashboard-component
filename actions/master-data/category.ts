"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { MasterCategorySchema } from "@/schema/category";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function createMasterCategory(
  values: z.infer<typeof MasterCategorySchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = MasterCategorySchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid data" };

  try {
    await db.category.create({
      data: {
        name: parsed.data.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/master-data/category");
    return { success: "Category created!" };
  } catch (error) {
    console.error("Error creating category:", error);
    return { error: "Failed to create category" };
  }
}

export async function getMasterCategory() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return db.category.findMany({});
}

export async function getMasterCategoryById(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return db.category.findUnique({
    where: {
      id,
    },
  });
}

export async function updateMasterCategory(
  id: string,
  values: z.infer<typeof MasterCategorySchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = MasterCategorySchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid data" };

  try {
    await db.category.update({
      where: {
        id,
      },
      data: {
        name: parsed.data.name,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/master-data/category");
    return { success: "Category updated!" };
  } catch (error) {
    console.error("Error updating category:", error);
    return { error: "Failed to update category" };
  }
}

export async function deleteMasterCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.category.delete({
      where: {
        id,
      },
    });
    revalidatePath("/admin/master-data/category");
    return { success: "Category deleted!" };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "Failed to delete category" };
  }
}
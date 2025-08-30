"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { MasterProductSchema } from "@/schema/product";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function createMasterProduct(
  values: z.infer<typeof MasterProductSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = MasterProductSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid data" };

  try {
    await db.product.create({
      data: {
        name: parsed.data.name,
        category_id: parsed.data.category_id,
        price: parsed.data.price,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/master-data/product");
    return { success: "Product created!" };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product" };
  }
}

export async function getMasterProduct() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const products = await db.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getMasterProductById(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function updateMasterProduct(
  id: string,
  values: z.infer<typeof MasterProductSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = MasterProductSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid data" };

  try {
    await db.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        category_id: parsed.data.category_id,
        price: parsed.data.price,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/master-data/product");
    return { success: "Product updated!" };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product" };
  }
}

export async function deleteMasterProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.product.delete({
      where: { id },
    });

    revalidatePath("/admin/master-data/product");
    return { success: "Product deleted!" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product" };
  }
}
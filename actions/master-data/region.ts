"use server";

import { db } from "@/lib/db";
import { MasterRegionSchema } from "@/schema/region";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function createMasterRegion(
  values: z.infer<typeof MasterRegionSchema>
) {
  try {
    const parsed = MasterRegionSchema.safeParse(values);
    if (!parsed.success) {
      return { error: "Invalid data" };
    }

    await db.region.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/master-data/region");
    return { success: "Region created!" };
  } catch (error) {
    console.error("Error creating region:", error);
    return { error: "Failed to create region" };
  }
}

export async function getMasterRegion() {
  return db.region.findMany();
}

export async function getMasterRegionById(id: string) {
  return db.region.findUnique({ where: { id } });
}

export async function updateMasterRegion(
  id: string,
  values: z.infer<typeof MasterRegionSchema>
) {
  try {
    const parsed = MasterRegionSchema.safeParse(values);
    if (!parsed.success) {
      return { error: "Invalid data" };
    }

    await db.region.update({
      where: { id },
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/master-data/region");
    return { success: "Region updated!" };
  } catch (error) {
    console.error("Error updating region:", error);
    return { error: "Failed to update region" };
  }
}

export async function deleteMasterRegion(id: string) {
  await db.region.delete({ where: { id } });

  revalidatePath("/admin/master-data/region");
  return { success: "Region deleted!" };
}

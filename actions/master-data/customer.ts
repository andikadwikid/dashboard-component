"use server";

import { db } from "@/lib/db";
import { MasterCustomerSchema } from "@/schema/customer";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function createMasterCustomer(
  values: z.infer<typeof MasterCustomerSchema>
) {
  const parsed = MasterCustomerSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid data" };

  await db.customer.create({
    data: {
      name: parsed.data.name,
      contact: parsed.data.contact,
      address: parsed.data.address,
      region_id: parsed.data.region_id,
      farm_name: parsed.data.farm_name,
      altitude: parsed.data.altitude,
      variety: parsed.data.variety,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  revalidatePath("/admin/master-data/customer");
  return { success: "Customer created!" };
}

export async function getMasterCustomer() {
  return db.customer.findMany();
}

export async function updateMasterCustomer(
  id: string,
  values: z.infer<typeof MasterCustomerSchema>
) {
  const parsed = MasterCustomerSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid data" };

  await db.customer.update({
    where: { id },
    data: {
      name: parsed.data.name,
      contact: parsed.data.contact,
      address: parsed.data.address,
      region_id: parsed.data.region_id,
      farm_name: parsed.data.farm_name,
      altitude: parsed.data.altitude,
      variety: parsed.data.variety,
    },
  });

  revalidatePath("/admin/master-data/customer");
  return { success: "Customer updated!" };
}

export async function deleteMasterCustomer(id: string) {
  await db.customer.delete({ where: { id } });
  revalidatePath("/admin/master-data/customer");
  return { success: "Customer deleted!" };
}

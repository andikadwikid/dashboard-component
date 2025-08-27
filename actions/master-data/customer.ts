"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { MasterCustomerSchema } from "@/schema/customer";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function createMasterCustomer(
  values: z.infer<typeof MasterCustomerSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = MasterCustomerSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid data" };

  try {
    await db.customer.create({
      data: {
        name: parsed.data.name,
        contact: parsed.data.contact,
        address: parsed.data.address,
        region_id: parsed.data.region_id,
        farm_name: parsed.data.farm_name,
        altitude: parsed.data.altitude,
        variety: parsed.data.variety,
        create_by: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/master-data/customer");
    return { success: "Customer created!" };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { error: "Failed to create customer" };
  }
}

export async function getMasterCustomer() {
  const session = await auth();
  console.log(session);
  if (!session?.user?.id) {
    return [];
  }

  return db.customer.findMany({
    where: {
      create_by: session.user.id,
    },
    include: {
      region: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function getMasterCustomerById(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return db.customer.findUnique({
    where: {
      id,
      create_by: session.user.id,
    },
    include: {
      region: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function updateMasterCustomer(
  id: string,
  values: z.infer<typeof MasterCustomerSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = MasterCustomerSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid data" };

  try {
    await db.customer.update({
      where: {
        id,
        create_by: session.user.id,
      },
      data: {
        name: parsed.data.name,
        contact: parsed.data.contact,
        address: parsed.data.address,
        region_id: parsed.data.region_id,
        farm_name: parsed.data.farm_name,
        altitude: parsed.data.altitude,
        variety: parsed.data.variety,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/master-data/customer");
    return { success: "Customer updated!" };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { error: "Failed to update customer" };
  }
}

export async function deleteMasterCustomer(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.customer.delete({
      where: {
        id,
        create_by: session.user.id,
      },
    });
    revalidatePath("/admin/master-data/customer");
    return { success: "Customer deleted!" };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { error: "Failed to delete customer" };
  }
}

"use server";

import { db } from "@/lib/db";
import { OrderSchema } from "@/schema/order";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const createOrder = async (values: z.infer<typeof OrderSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = OrderSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { customer_selection, status } = validatedFields.data;

  try {
    let customerId: string;
    let customerHistoryId: string;

    // Handle customer selection
    if (
      customer_selection.mode === "existing" &&
      customer_selection.customer_id
    ) {
      // Use existing customer
      customerId = customer_selection.customer_id;

      // Get existing customer data for history
      const existingCustomer = await db.customer.findUnique({
        where: { id: customerId },
      });

      if (!existingCustomer) {
        return { error: "Customer not found" };
      }

      // Get region name for customer history
      const region = await db.region.findUnique({
        where: { id: existingCustomer.region_id },
        select: { name: true },
      });

      if (!region) {
        return { error: "Region not found" };
      }

      // Create customer history record
      const customerHistory = await db.customerHistory.create({
        data: {
          customer_id: customerId,
          name: existingCustomer.name,
          contact: existingCustomer.contact,
          address: existingCustomer.address,
          region_name: region.name,
          farm_name: existingCustomer.farm_name,
          altitude: existingCustomer.altitude,
          variety: existingCustomer.variety,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      customerHistoryId = customerHistory.id;
    } else if (
      customer_selection.mode === "new" &&
      customer_selection.customer_data
    ) {
      // Get region name for new customer
      const region = await db.region.findUnique({
        where: { id: customer_selection.customer_data.region_id },
        select: { name: true },
      });

      if (!region) {
        return { error: "Region not found" };
      }

      // Create new customer
      const newCustomer = await db.customer.create({
        data: {
          ...customer_selection.customer_data,
          create_by: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      customerId = newCustomer.id;

      // Create customer history record
      const customerHistory = await db.customerHistory.create({
        data: {
          customer_id: customerId,
          name: newCustomer.name,
          contact: newCustomer.contact,
          address: newCustomer.address,
          region_name: region.name,
          farm_name: newCustomer.farm_name,
          altitude: newCustomer.altitude,
          variety: newCustomer.variety,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      customerHistoryId = customerHistory.id;
    } else {
      return { error: "Invalid customer selection" };
    }

    // Create order (simplified)
    const order = await db.order.create({
      data: {
        customer_history_id: customerHistoryId,
        sales_id: session.user.id,
        status: status || "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/order");
    return { success: "Order created successfully!", orderId: order.id };
  } catch (error) {
    console.error("Error creating order:", error);
    return { error: "Failed to create order" };
  }
};

export async function getOrders() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return db.order.findMany({
    where: {
      sales_id: session.user.id,
    },
    include: {
      customer_history: true,
      OrderItem: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getOrderById(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return db.order.findUnique({
    where: {
      id,
      sales_id: session.user.id,
    },
    include: {
      customer_history: true,
      OrderItem: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });
}

export async function updateOrder(
  id: string,
  values: Partial<z.infer<typeof OrderSchema>>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = OrderSchema.partial().safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  try {
    await db.order.update({
      where: {
        id,
        sales_id: session.user.id,
      },
      data: {
        ...parsed.data,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/order");
    return { success: "Order updated successfully!" };
  } catch (error) {
    console.error("Error updating order:", error);
    return { error: "Failed to update order" };
  }
}

export async function deleteOrder(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Delete order items first
    await db.orderItem.deleteMany({
      where: {
        order_id: id,
      },
    });

    // Delete order
    await db.order.delete({
      where: {
        id,
        sales_id: session.user.id,
      },
    });

    revalidatePath("/admin/order");
    return { success: "Order deleted successfully!" };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { error: "Failed to delete order" };
  }
}

// Helper function to get products for order items
export async function getProducts() {
  return db.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

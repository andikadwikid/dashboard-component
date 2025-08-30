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
      customer_history: {
        select: {
          name: true,
          contact: true,
          region_name: true,
          farm_name: true,
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
      sales: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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

export async function cancelOrder(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // First check if order exists and belongs to the user
    const existingOrder = await db.order.findUnique({
      where: {
        id,
        sales_id: session.user.id,
      },
    });

    if (!existingOrder) {
      return { error: "Order not found" };
    }

    // Check if order is already cancelled
    if (existingOrder.status === "cancelled") {
      return { error: "Order is already cancelled" };
    }

    // Check if order is completed (cannot cancel completed orders)
    if (existingOrder.status === "completed") {
      return { error: "Cannot cancel completed order" };
    }

    // Update order status to cancelled
    await db.order.update({
      where: {
        id,
        sales_id: session.user.id,
      },
      data: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/order");
    revalidatePath(`/admin/order/detail/${id}`);
    return { success: "Order cancelled successfully!" };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { error: "Failed to cancel order" };
  }
}

export async function completeOrder(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // First check if order exists and belongs to the user
    const existingOrder = await db.order.findUnique({
      where: {
        id,
        sales_id: session.user.id,
      },
    });

    if (!existingOrder) {
      return { error: "Order not found" };
    }

    // Check if order is already completed
    if (existingOrder.status === "completed") {
      return { error: "Order is already completed" };
    }

    // Check if order is cancelled (cannot complete cancelled orders)
    if (existingOrder.status === "cancelled") {
      return { error: "Cannot complete cancelled order" };
    }

    // Check if result stage is completed
    const resultProgress = await db.orderProgress.findFirst({
      where: {
        order_id: id,
        stage: "result",
      },
    });

    if (!resultProgress) {
      return { error: "Result stage must be completed before completing order" };
    }

    const resultData = resultProgress.data as Record<string, unknown>;
    const isResultCompleted = !!resultData?.status;

    if (!isResultCompleted) {
      return { error: "Result stage must be completed before completing order" };
    }

    // Update order status to completed
    await db.order.update({
      where: {
        id,
        sales_id: session.user.id,
      },
      data: {
        status: "completed",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/order");
    revalidatePath(`/admin/order/detail/${id}`);
    return { success: "Order completed successfully!" };
  } catch (error) {
    console.error("Error completing order:", error);
    return { error: "Failed to complete order" };
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

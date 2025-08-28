"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  OrderProgressSchema,
  UpdateOrderProgressSchema,
  validateStageData,
  type OrderProgressType,
  type UpdateOrderProgressType,
} from "@/schema/order-progress";

// Create new order progress
export async function createOrderProgress(data: OrderProgressType) {
  try {
    // Validate input data
    const validatedData = OrderProgressSchema.parse(data);

    // Validate stage-specific data
    const stageValidation = validateStageData(
      validatedData.stage,
      validatedData.data
    );

    if (!stageValidation.success) {
      return {
        success: false,
        message: "Invalid data for stage",
        error: stageValidation.error,
      };
    }

    // Check if order exists
    const order = await db.order.findUnique({
      where: { id: validatedData.order_id },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    // Check if progress for this stage already exists
    const existingProgress = await db.orderProgress.findFirst({
      where: {
        order_id: validatedData.order_id,
        stage: validatedData.stage,
      },
    });

    if (existingProgress) {
      return {
        success: false,
        message: `Progress for ${validatedData.stage} stage already exists`,
      };
    }

    // Create order progress
    const orderProgress = await db.orderProgress.create({
      data: {
        order_id: validatedData.order_id,
        stage: validatedData.stage,
        data: validatedData.data as any,
      },
    });

    revalidatePath("/admin/order");
    revalidatePath(`/admin/order/detail/${validatedData.order_id}`);

    return {
      success: true,
      message: "Order progress created successfully",
      data: orderProgress,
    };
  } catch (error) {
    console.error("Error creating order progress:", error);
    return {
      success: false,
      message: "Failed to create order progress",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update existing order progress
export async function updateOrderProgress(data: UpdateOrderProgressType) {
  try {
    // Validate input data
    const validatedData = UpdateOrderProgressSchema.parse(data);

    // Get existing progress to validate stage
    const existingProgress = await db.orderProgress.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingProgress) {
      return {
        success: false,
        message: "Order progress not found",
      };
    }

    // Validate stage-specific data
    const stageValidation = validateStageData(
      existingProgress.stage,
      validatedData.data
    );

    if (!stageValidation.success) {
      return {
        success: false,
        message: "Invalid data for stage",
        error: stageValidation.error,
      };
    }

    // Update order progress
    const updatedProgress = await db.orderProgress.update({
      where: { id: validatedData.id },
      data: {
        data: validatedData.data as any,
      },
    });

    revalidatePath("/admin/order");
    revalidatePath(`/admin/order/detail/${existingProgress.order_id}`);

    return {
      success: true,
      message: "Order progress updated successfully",
      data: updatedProgress,
    };
  } catch (error) {
    console.error("Error updating order progress:", error);
    return {
      success: false,
      message: "Failed to update order progress",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get all progress for an order
export async function getOrderProgress(orderId: string) {
  try {
    if (!orderId) {
      return {
        success: false,
        message: "Order ID is required",
      };
    }

    const progressList = await db.orderProgress.findMany({
      where: { order_id: orderId },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: progressList,
    };
  } catch (error) {
    console.error("Error getting order progress:", error);
    return {
      success: false,
      message: "Failed to get order progress",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get specific progress by stage
export async function getOrderProgressByStage(
  orderId: string,
  stage: string
) {
  try {
    if (!orderId || !stage) {
      return {
        success: false,
        message: "Order ID and stage are required",
      };
    }

    const progress = await db.orderProgress.findFirst({
      where: {
        order_id: orderId,
        stage: stage,
      },
    });

    return {
      success: true,
      data: progress,
    };
  } catch (error) {
    console.error("Error getting order progress by stage:", error);
    return {
      success: false,
      message: "Failed to get order progress",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Delete order progress (optional, for admin purposes)
export async function deleteOrderProgress(progressId: string) {
  try {
    if (!progressId) {
      return {
        success: false,
        message: "Progress ID is required",
      };
    }

    const existingProgress = await db.orderProgress.findUnique({
      where: { id: progressId },
    });

    if (!existingProgress) {
      return {
        success: false,
        message: "Order progress not found",
      };
    }

    await db.orderProgress.delete({
      where: { id: progressId },
    });

    revalidatePath("/admin/order");
    revalidatePath(`/admin/order/detail/${existingProgress.order_id}`);

    return {
      success: true,
      message: "Order progress deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting order progress:", error);
    return {
      success: false,
      message: "Failed to delete order progress",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
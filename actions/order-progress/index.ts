"use server";

/**
 * Order Progress Actions
 *
 * Modul ini berisi semua server actions untuk mengelola progres pesanan.
 * Fitur ini memungkinkan tracking progres pesanan melalui 4 tahapan:
 * 1. Warehouse (Gudang) - Input data gudang dan status
 * 2. Shipping (Pengiriman) - Input data pengiriman dan status
 * 3. Applied (Aplikasi) - Input estimasi area aplikasi
 * 4. Result (Hasil) - Input hasil yield
 *
 * Dependencies:
 * - @/lib/db: Database connection menggunakan Prisma
 * - next/cache: Untuk revalidasi cache Next.js
 * - @prisma/client: Type definitions untuk Prisma
 * - @/schema/order-progress: Validation schemas menggunakan Zod
 */

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, OrderStatus } from "@prisma/client";
import {
  OrderProgressSchema,
  WarehouseProgressSchema,
  ShippingProgressSchema,
  AppliedProgressSchema,
  ResultProgressSchema,
  type ProgressStage,
  type ShippingData,
} from "@/schema/order-progress";

/**
 * Menentukan status order berdasarkan progress yang ada
 * 
 * @param orderId - ID pesanan
 * @returns Promise<OrderStatus> - Status order yang sesuai
 */
async function determineOrderStatus(orderId: string): Promise<OrderStatus> {
  // Ambil semua progress untuk order ini
  const allProgress = await db.orderProgress.findMany({
    where: { order_id: orderId },
    orderBy: { createdAt: 'asc' }
  });

  // Cari progress shipping untuk cek date_received
  const shippingProgress = allProgress.find(p => p.stage === 'shipping');
  if (shippingProgress) {
    const shippingData = shippingProgress.data as unknown as ShippingData;
    
    // Jika ada date_received, status menjadi "delivered"
    if (shippingData.date_received) {
      return 'delivered';
    }
    
    // Jika shipping status true dan ada date_shipping, status menjadi "shipped"
    if (shippingData.status && shippingData.date_shipping) {
      return 'shipped';
    }
  }

  // Cari progress warehouse
  const warehouseProgress = allProgress.find(p => p.stage === 'warehouse');
  if (warehouseProgress) {
    const warehouseData = warehouseProgress.data as unknown as { status: boolean };
    
    // Jika warehouse status true, status menjadi "warehouse"
    if (warehouseData.status) {
      return 'warehouse';
    }
  }

  // Default tetap pending jika tidak ada kondisi yang terpenuhi
  return 'pending';
}

/**
 * Update status order berdasarkan progress
 * 
 * @param orderId - ID pesanan
 */
async function updateOrderStatus(orderId: string): Promise<void> {
  const newStatus = await determineOrderStatus(orderId);
  
  await db.order.update({
    where: { id: orderId },
    data: { 
      status: newStatus,
      updatedAt: new Date()
    }
  });
}

/**
 * Membuat progres pesanan baru untuk tahapan tertentu
 *
 * @param formData - FormData yang berisi:
 *   - order_id: ID pesanan (string)
 *   - stage: Tahapan progres ("warehouse" | "shipping" | "applied" | "result")
 *   - data: Data JSON sesuai dengan tahapan (string yang akan di-parse)
 *
 * @returns Promise<{
 *   success: boolean;
 *   data?: OrderProgress;
 *   message?: string;
 *   error?: string;
 * }>
 *
 * @example
 * const formData = new FormData();
 * formData.append("order_id", "order-123");
 * formData.append("stage", "warehouse");
 * formData.append("data", JSON.stringify({ status: true, notes: "Ready" }));
 *
 * const result = await createOrderProgress(formData);
 * if (result.success) {
 *   console.log("Progress created:", result.data);
 * }
 */
export async function createOrderProgress(formData: FormData) {
  try {
    const rawData = {
      order_id: formData.get("order_id") as string,
      stage: formData.get("stage") as ProgressStage,
      data: JSON.parse(formData.get("data") as string),
    };

    // Check order status first - prevent progress update if order is cancelled
    const order = await db.order.findUnique({
      where: { id: rawData.order_id },
      select: { status: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "cancelled") {
      throw new Error("Cannot create progress for cancelled order");
    }

    // Validate based on stage
    let validatedData;
    switch (rawData.stage) {
      case "warehouse":
        validatedData = WarehouseProgressSchema.parse(rawData);
        break;
      case "shipping":
        validatedData = ShippingProgressSchema.parse(rawData);
        break;
      case "applied":
        validatedData = AppliedProgressSchema.parse(rawData);
        break;
      case "result":
        validatedData = ResultProgressSchema.parse(rawData);
        break;
      default:
        throw new Error("Invalid stage");
    }

    // Check if progress for this stage already exists
    const existingProgress = await db.orderProgress.findFirst({
      where: {
        order_id: validatedData.order_id,
        stage: validatedData.stage,
      },
    });

    if (existingProgress) {
      throw new Error(
        `Progress for ${validatedData.stage} stage already exists`
      );
    }

    // Create new progress
    const orderProgress = await db.orderProgress.create({
      data: {
        order_id: validatedData.order_id,
        stage: validatedData.stage,
        data: validatedData.data as Prisma.InputJsonValue,
        createdAt: new Date(),
      },
    });

    // Update order status based on progress
    await updateOrderStatus(validatedData.order_id);

    revalidatePath("/admin/order");
    revalidatePath(`/admin/order/detail/${validatedData.order_id}`);

    return {
      success: true,
      data: orderProgress,
      message: `${validatedData.stage} progress created successfully`,
    };
  } catch (error) {
    console.error("Error creating order progress:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create progress",
    };
  }
}

/**
 * Memperbarui progres pesanan yang sudah ada
 *
 * @param id - ID progres yang akan diupdate (string)
 * @param formData - FormData yang berisi:
 *   - order_id: ID pesanan (string)
 *   - stage: Tahapan progres (string)
 *   - data: Data JSON yang diperbarui (string)
 *
 * @returns Promise<{
 *   success: boolean;
 *   data?: OrderProgress;
 *   message?: string;
 *   error?: string;
 * }>
 *
 * @example
 * const formData = new FormData();
 * formData.append("order_id", "order-123");
 * formData.append("stage", "warehouse");
 * formData.append("data", JSON.stringify({ status: true, notes: "Updated" }));
 *
 * const result = await updateOrderProgress("progress-id", formData);
 */
export async function updateOrderProgress(id: string, formData: FormData) {
  try {
    const rawData = {
      order_id: formData.get("order_id") as string,
      stage: formData.get("stage") as ProgressStage,
      data: JSON.parse(formData.get("data") as string),
    };

    // Check order status first - prevent progress update if order is cancelled
    const order = await db.order.findUnique({
      where: { id: rawData.order_id },
      select: { status: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "cancelled") {
      throw new Error("Cannot update progress for cancelled order");
    }

    // Validate based on stage
    let validatedData;
    switch (rawData.stage) {
      case "warehouse":
        validatedData = WarehouseProgressSchema.parse(rawData);
        break;
      case "shipping":
        validatedData = ShippingProgressSchema.parse(rawData);
        break;
      case "applied":
        validatedData = AppliedProgressSchema.parse(rawData);
        break;
      case "result":
        validatedData = ResultProgressSchema.parse(rawData);
        break;
      default:
        throw new Error("Invalid stage");
    }

    // Update progress
    const orderProgress = await db.orderProgress.update({
      where: { id },
      data: {
        data: validatedData.data as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    // Update order status based on progress
    await updateOrderStatus(validatedData.order_id);

    revalidatePath("/admin/order");
    revalidatePath(`/admin/order/detail/${validatedData.order_id}`);

    return {
      success: true,
      data: orderProgress,
      message: `${validatedData.stage} progress updated successfully`,
    };
  } catch (error) {
    console.error("Error updating order progress:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update progress",
    };
  }
}

/**
 * Mengambil semua progres pesanan berdasarkan ID pesanan
 *
 * @param orderId - ID pesanan (string)
 *
 * @returns Promise<{
 *   success: boolean;
 *   data?: OrderProgress[];
 *   error?: string;
 * }>
 *
 * @example
 * const result = await getOrderProgressByOrderId("order-123");
 * if (result.success) {
 *   console.log("All progress:", result.data);
 * }
 */
export async function getOrderProgressByOrderId(orderId: string) {
  try {
    const orderProgress = await db.orderProgress.findMany({
      where: {
        order_id: orderId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      success: true,
      data: orderProgress,
    };
  } catch (error) {
    console.error("Error fetching order progress:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch progress",
    };
  }
}

/**
 * Mengambil progres untuk tahapan tertentu dari pesanan
 *
 * @param orderId - ID pesanan (string)
 * @param stage - Tahapan yang dicari ("warehouse" | "shipping" | "applied" | "result")
 *
 * @returns Promise<{
 *   success: boolean;
 *   data?: OrderProgress | null;
 *   error?: string;
 * }>
 *
 * @example
 * const result = await getStageProgress("order-123", "warehouse");
 * if (result.success && result.data) {
 *   console.log("Warehouse progress:", result.data);
 * }
 */
export async function getStageProgress(orderId: string, stage: ProgressStage) {
  try {
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
    console.error("Error fetching stage progress:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch stage progress",
    };
  }
}

/**
 * Menghapus progres pesanan berdasarkan ID
 *
 * @param id - ID progres yang akan dihapus (string)
 *
 * @returns Promise<{
 *   success: boolean;
 *   message?: string;
 *   error?: string;
 * }>
 *
 * @example
 * const result = await deleteOrderProgress("progress-id");
 * if (result.success) {
 *   console.log("Progress deleted successfully");
 * }
 */
export async function deleteOrderProgress(id: string) {
  try {
    const progress = await db.orderProgress.findUnique({
      where: { id },
      include: {
        Order: {
          select: { status: true },
        },
      },
    });

    if (!progress) {
      throw new Error("Progress not found");
    }

    // Check order status - prevent progress deletion if order is cancelled
    if (progress.Order.status === "cancelled") {
      throw new Error("Cannot delete progress for cancelled order");
    }

    await db.orderProgress.delete({
      where: { id },
    });

    revalidatePath("/admin/order");
    revalidatePath(`/admin/order/detail/${progress.order_id}`);

    return {
      success: true,
      message: "Progress deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting order progress:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete progress",
    };
  }
}

/**
 * Mengambil status lengkap semua tahapan progres untuk pesanan tertentu
 *
 * Fungsi ini mengembalikan status completed untuk setiap tahapan berdasarkan:
 * - Warehouse & Shipping: status === true
 * - Applied: est_applied_area > 0
 * - Result: status === true
 *
 * @param orderId - ID pesanan (string)
 *
 * @returns Promise<{
 *   success: boolean;
 *   data?: Array<{
 *     stage: string;
 *     completed: boolean;
 *     data: any | null;
 *     createdAt: Date | null;
 *     updatedAt: Date | null;
 *   }>;
 *   error?: string;
 * }>
 *
 * @example
 * const result = await getProgressStagesStatus("order-123");
 * if (result.success) {
 *   result.data?.forEach(stage => {
 *     console.log(`${stage.stage}: ${stage.completed ? 'Completed' : 'Pending'}`);
 *   });
 * }
 */
export async function getProgressStagesStatus(orderId: string) {
  try {
    const allProgress = await db.orderProgress.findMany({
      where: {
        order_id: orderId,
      },
    });

    const stages = ["warehouse", "shipping", "applied", "result"] as const;
    const stagesStatus = stages.map((stage) => {
      const progress = allProgress.find((p) => p.stage === stage);

      let completed = false;
      if (progress) {
        const data = progress.data as Record<string, unknown>;

        switch (stage) {
          case "warehouse":
          case "shipping":
            // For warehouse and shipping, check if status is true
            completed =
              typeof data?.status === "boolean" && data.status === true;
            break;
          case "applied":
            // For applied, check if est_applied_area exists and is positive
            completed =
              typeof data?.est_applied_area === "number" &&
              data.est_applied_area > 0;
            break;
          case "result":
            // For result, check if status is true
            completed = !!data?.status;
            break;
          default:
            completed = false;
        }
      }

      return {
        stage,
        completed,
        data: progress?.data || null,
        createdAt: progress?.createdAt || null,
        updatedAt: progress?.updatedAt || null,
      };
    });

    return {
      success: true,
      data: stagesStatus,
    };
  } catch (error) {
    console.error("Error fetching progress stages status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch stages status",
    };
  }
}

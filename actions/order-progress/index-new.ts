"use server";

/**
 * Order Progress Actions - Modular Implementation
 * 
 * File ini menyediakan backward compatibility dengan API yang sudah ada
 * sambil menggunakan arsitektur modular yang baru. Semua fungsi existing
 * akan tetap bekerja, namun sekarang menggunakan service-based architecture.
 * 
 * Implementasi prinsip SOLID:
 * - Single Responsibility: Setiap service menangani satu tahapan
 * - Open/Closed: Mudah diperluas tanpa mengubah kode existing
 * - Liskov Substitution: Semua service mengimplementasikan interface yang sama
 * - Interface Segregation: Interface yang spesifik untuk setiap kebutuhan
 * - Dependency Inversion: Bergantung pada abstraksi, bukan implementasi
 */

import { orderProgressManager } from "./service-manager";
import { 
  OrderProgressResponse, 
  ProgressInput,
  ProgressStage
} from "./types";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma, OrderStatus } from "@prisma/client";
import {
  OrderProgressSchema,
  WarehouseProgressSchema,
  ShippingProgressSchema,
  AppliedProgressSchema,
  ResultProgressSchema,
  type ProgressStage as SchemaProgressStage,
  type ShippingData,
} from "@/schema/order-progress";

/**
 * Legacy function: Create Order Progress
 * 
 * Fungsi ini mempertahankan API yang sudah ada untuk backward compatibility
 * sambil menggunakan service modular di belakang layar.
 * 
 * @param input - Data input progress
 * @returns Promise<OrderProgressResponse> - Response hasil create
 */
export async function createOrderProgress(input: ProgressInput): Promise<OrderProgressResponse> {
  return await orderProgressManager.createProgress(input);
}

/**
 * Legacy function: Update Order Progress
 * 
 * @param id - ID progress yang akan diupdate
 * @param input - Data input untuk update
 * @returns Promise<OrderProgressResponse> - Response hasil update
 */
export async function updateOrderProgress(id: string, input: ProgressInput): Promise<OrderProgressResponse> {
  return await orderProgressManager.updateProgress(id, input);
}

/**
 * Legacy function: Get Order Progress by Order ID
 * 
 * @param orderId - ID pesanan
 * @returns Promise<OrderProgressResponse> - Response dengan semua progress data
 */
export async function getOrderProgressByOrderId(orderId: string): Promise<OrderProgressResponse> {
  try {
    const progressList = await db.orderProgress.findMany({
      where: { order_id: orderId },
      orderBy: { createdAt: 'asc' }
    });

    return {
      success: true,
      data: progressList,
      message: `Found ${progressList.length} progress records`
    };
  } catch (error) {
    console.error("Error getting order progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get order progress"
    };
  }
}

/**
 * Legacy function: Get Stage Progress
 * 
 * @param orderId - ID pesanan
 * @param stage - Tahapan progress
 * @returns Promise<OrderProgressResponse> - Response dengan data progress tahapan
 */
export async function getStageProgress(orderId: string, stage: SchemaProgressStage): Promise<OrderProgressResponse> {
  return await orderProgressManager.getProgress(orderId, stage as ProgressStage);
}

/**
 * Legacy function: Delete Order Progress
 * 
 * @param id - ID progress yang akan dihapus
 * @returns Promise<OrderProgressResponse> - Response hasil delete
 */
export async function deleteOrderProgress(id: string): Promise<OrderProgressResponse> {
  try {
    // Get progress data untuk menentukan stage
    const progress = await db.orderProgress.findUnique({
      where: { id },
      select: { stage: true }
    });

    if (!progress) {
      return {
        success: false,
        error: "Progress not found"
      };
    }

    return await orderProgressManager.deleteProgress(id, progress.stage as ProgressStage);
  } catch (error) {
    console.error("Error deleting order progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete order progress"
    };
  }
}

/**
 * Legacy function: Get Progress Stages Status
 * 
 * @param orderId - ID pesanan
 * @returns Promise<Record<string, boolean>> - Status completion semua tahapan
 */
export async function getProgressStagesStatus(orderId: string): Promise<Record<string, boolean>> {
  const status = await orderProgressManager.getAllStagesStatus(orderId);
  return status as Record<string, boolean>;
}

/**
 * Enhanced function: Get Progress Summary
 * 
 * Fungsi baru yang memanfaatkan kemampuan service manager untuk
 * memberikan informasi yang lebih komprehensif.
 * 
 * @param orderId - ID pesanan
 * @returns Promise<object> - Summary lengkap progress
 */
export async function getProgressSummary(orderId: string) {
  return await orderProgressManager.getProgressSummary(orderId);
}

/**
 * Enhanced function: Validate Prerequisites
 * 
 * @param orderId - ID pesanan
 * @param stage - Tahapan yang akan divalidasi
 * @returns Promise<boolean> - true jika prerequisites terpenuhi
 */
export async function validateStagePrerequisites(orderId: string, stage: SchemaProgressStage): Promise<boolean> {
  return await orderProgressManager.validatePrerequisites(orderId, stage as ProgressStage);
}

/**
 * Enhanced function: Get Next Available Stage
 * 
 * @param orderId - ID pesanan
 * @returns Promise<string | null> - Tahapan berikutnya yang bisa diakses
 */
export async function getNextAvailableStage(orderId: string): Promise<string | null> {
  return await orderProgressManager.getNextAvailableStage(orderId);
}

/**
 * Enhanced function: Bulk Progress Summary
 * 
 * @param orderIds - Array ID pesanan
 * @returns Promise<Record<string, object>> - Summary untuk setiap order
 */
export async function getBulkProgressSummary(orderIds: string[]): Promise<Record<string, object>> {
  return await orderProgressManager.getBulkProgressSummary(orderIds);
}

// ===== LEGACY FUNCTIONS - Maintained for backward compatibility =====

/**
 * Legacy function: Determine Order Status
 * 
 * Fungsi ini tetap dipertahankan untuk backward compatibility.
 * Logika sudah dipindahkan ke base-service.ts
 */
export async function determineOrderStatus(orderId: string): Promise<OrderStatus> {
  try {
    const progressData = await db.orderProgress.findMany({
      where: { order_id: orderId },
      select: { stage: true, data: true }
    });

    const stages = {
      warehouse: false,
      shipping: false,
      applied: false,
      result: false
    };

    // Check completion status for each stage
    for (const progress of progressData) {
      const data = progress.data as Record<string, unknown>;
      
      switch (progress.stage) {
        case 'warehouse':
          stages.warehouse = data.status === true;
          break;
        case 'shipping':
          stages.shipping = data.status === true;
          break;
        case 'applied':
          stages.applied = typeof data.est_applied_area === 'number' && data.est_applied_area > 0;
          break;
        case 'result':
          stages.result = data.status === true;
          break;
      }
    }

    // Determine status based on completed stages
    if (stages.result) return OrderStatus.completed;
    if (stages.applied) return OrderStatus.delivered;
    if (stages.shipping) return OrderStatus.shipped;
    if (stages.warehouse) return OrderStatus.warehouse;
    
    return OrderStatus.pending;
  } catch (error) {
    console.error("Error determining order status:", error);
    return OrderStatus.pending;
  }
}

/**
 * Legacy function: Update Order Status
 * 
 * @param orderId - ID pesanan
 */
export async function updateOrderStatus(orderId: string): Promise<void> {
  try {
    const newStatus = await determineOrderStatus(orderId);
    
    await db.order.update({
      where: { id: orderId },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      }
    });

    // Revalidate related pages
    revalidatePath(`/admin/order/detail/${orderId}`);
    revalidatePath('/admin/order');
    revalidatePath('/admin/order-progress');
  } catch (error) {
    console.error("Error updating order status:", error);
  }
}

// ===== EXPORT SERVICE INSTANCES =====

// Export service manager untuk akses langsung
export { orderProgressManager };

// Export individual services
export {
  warehouseService,
  shippingService,
  appliedService,
  resultService
} from "./service-manager";

// Export types untuk external usage
export type {
  OrderProgressResponse,
  ProgressInput,
  ProgressStage,
  WarehouseData,
  ShippingData,
  AppliedData,
  ResultData
} from "./types";
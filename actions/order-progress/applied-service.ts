"use server";

/**
 * Applied Progress Service
 * 
 * Modul ini menangani semua operasi yang berkaitan dengan progress applied.
 * Mengimplementasikan prinsip Single Responsibility dan Dependency Injection.
 * 
 * Fitur:
 * - Create applied progress
 * - Update applied progress
 * - Get applied progress data
 * - Delete applied progress
 * - Validasi khusus applied (area estimasi vs aktual)
 * - Logika bisnis applied (shipping prerequisite)
 */

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { AppliedProgressSchema } from "@/schema/order-progress";
import { 
  OrderProgressResponse, 
  AppliedData, 
  ProgressInput,
  BaseProgressService,
  ShippingData 
} from "./types";
import {
  validateOrder,
  checkExistingProgress,
  updateOrderStatus,
  revalidateOrderPages,
  getStageProgressData,
  deleteProgressById
} from "./base-service";

/**
 * Applied Progress Service Class
 * 
 * Implementasi service untuk mengelola applied progress dengan
 * logika bisnis yang terisolasi dan interface yang jelas.
 */
export class AppliedProgressService implements BaseProgressService {
  private readonly stage = "applied";

  /**
   * Validasi data applied sebelum disimpan
   * 
   * @param data - Data applied yang akan divalidasi
   * @throws Error jika validasi gagal
   */
  private validateAppliedData(data: AppliedData): void {
    // Validasi est_applied_area (wajib)
    if (typeof data.est_applied_area !== 'number') {
      throw new Error("Estimated applied area must be a number");
    }

    if (data.est_applied_area <= 0) {
      throw new Error("Estimated applied area must be greater than 0");
    }

    if (data.est_applied_area > 1000000) {
      throw new Error("Estimated applied area cannot exceed 1,000,000");
    }

    // Validasi actual_applied_area (opsional)
    if (data.actual_applied_area !== undefined) {
      if (typeof data.actual_applied_area !== 'number') {
        throw new Error("Actual applied area must be a number");
      }

      if (data.actual_applied_area < 0) {
        throw new Error("Actual applied area cannot be negative");
      }

      if (data.actual_applied_area > 1000000) {
        throw new Error("Actual applied area cannot exceed 1,000,000");
      }

      // Validasi logika bisnis: actual tidak boleh terlalu jauh dari estimasi
      const variance = Math.abs(data.actual_applied_area - data.est_applied_area);
      const maxVariance = data.est_applied_area * 0.5; // 50% variance
      
      if (variance > maxVariance) {
        throw new Error("Actual applied area variance cannot exceed 50% of estimated area");
      }
    }

    // Validasi notes
    if (data.notes && typeof data.notes !== 'string') {
      throw new Error("Applied notes must be string");
    }

    if (data.notes && data.notes.length > 500) {
      throw new Error("Applied notes cannot exceed 500 characters");
    }
  }

  /**
   * Logika bisnis khusus applied
   * 
   * Menentukan apakah applied progress dapat dibuat berdasarkan:
   * - Shipping progress harus sudah selesai dan delivered
   * - Tidak boleh ada progress applied sebelumnya
   * 
   * @param orderId - ID pesanan
   * @throws Error jika kondisi tidak terpenuhi
   */
  private async validateAppliedBusinessRules(orderId: string): Promise<void> {
    // Cek apakah sudah ada progress applied
    const hasExisting = await checkExistingProgress(orderId, this.stage);
    if (hasExisting) {
      throw new Error(`Progress for ${this.stage} stage already exists`);
    }

    // Cek apakah shipping progress sudah selesai dan delivered
    const shippingProgress = await getStageProgressData(orderId, "shipping");
    if (!shippingProgress) {
      throw new Error("Shipping progress must be completed before applied");
    }

    const shippingData = shippingProgress.data as unknown as ShippingData;
    if (!shippingData.status || !shippingData.date_shipping) {
      throw new Error("Shipping must be completed before applied");
    }

    if (!shippingData.date_received) {
      throw new Error("Item must be delivered before applied");
    }
  }

  /**
   * Create applied progress
   * 
   * @param input - Data input untuk applied progress
   * @returns Promise<OrderProgressResponse> - Response dengan data progress yang dibuat
   */
  async create(input: ProgressInput): Promise<OrderProgressResponse> {
    try {
      // Validasi order
      await validateOrder(input.order_id);

      // Validasi dengan schema Zod
      const validatedData = AppliedProgressSchema.parse(input);

      // Validasi data applied
      this.validateAppliedData(validatedData.data as AppliedData);

      // Validasi business rules
      await this.validateAppliedBusinessRules(input.order_id);

      // Create progress
      const orderProgress = await db.orderProgress.create({
        data: {
          order_id: validatedData.order_id,
          stage: validatedData.stage,
          data: validatedData.data as Prisma.InputJsonValue,
          createdAt: new Date(),
        },
      });

      // Update order status
      await updateOrderStatus(validatedData.order_id);

      // Revalidate cache
      revalidateOrderPages(validatedData.order_id);

      return {
        success: true,
        data: orderProgress,
        message: `Applied progress created successfully`,
      };
    } catch (error) {
      console.error("Error creating applied progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create applied progress",
      };
    }
  }

  /**
   * Update applied progress
   * 
   * @param id - ID progress yang akan diupdate
   * @param input - Data input untuk update
   * @returns Promise<OrderProgressResponse> - Response dengan data progress yang diupdate
   */
  async update(id: string, input: ProgressInput): Promise<OrderProgressResponse> {
    try {
      // Validasi order
      await validateOrder(input.order_id);

      // Validasi dengan schema Zod
      const validatedData = AppliedProgressSchema.parse(input);

      // Validasi data applied
      this.validateAppliedData(validatedData.data as AppliedData);

      // Update progress
      const orderProgress = await db.orderProgress.update({
        where: { id },
        data: {
          data: validatedData.data as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
      });

      // Update order status
      await updateOrderStatus(validatedData.order_id);

      // Revalidate cache
      revalidateOrderPages(validatedData.order_id);

      return {
        success: true,
        data: orderProgress,
        message: `Applied progress updated successfully`,
      };
    } catch (error) {
      console.error("Error updating applied progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update applied progress",
      };
    }
  }

  /**
   * Get applied progress data
   * 
   * @param orderId - ID pesanan
   * @returns Promise<OrderProgressResponse> - Response dengan data applied progress
   */
  async get(orderId: string): Promise<OrderProgressResponse> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      
      return {
        success: true,
        data: progress,
        message: progress ? "Applied progress found" : "No applied progress found",
      };
    } catch (error) {
      console.error("Error getting applied progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get applied progress",
      };
    }
  }

  /**
   * Delete applied progress
   * 
   * @param id - ID progress yang akan dihapus
   * @returns Promise<OrderProgressResponse> - Response hasil penghapusan
   */
  async delete(id: string): Promise<OrderProgressResponse> {
    try {
      // Get progress data untuk mendapatkan order_id
      const progress = await db.orderProgress.findUnique({
        where: { id },
        select: { order_id: true }
      });

      if (!progress) {
        throw new Error("Applied progress not found");
      }

      // Cek apakah ada progress result yang bergantung pada applied
      const resultProgress = await db.orderProgress.findFirst({
        where: {
          order_id: progress.order_id,
          stage: "result"
        }
      });

      if (resultProgress) {
        throw new Error("Cannot delete applied progress. Result progress exists.");
      }

      // Delete progress
      const deleted = await deleteProgressById(id);
      
      if (!deleted) {
        throw new Error("Failed to delete applied progress");
      }

      // Update order status after deletion
      await updateOrderStatus(progress.order_id);

      // Revalidate cache
      revalidateOrderPages(progress.order_id);

      return {
        success: true,
        message: "Applied progress deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting applied progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete applied progress",
      };
    }
  }

  /**
   * Check if applied is completed
   * 
   * @param orderId - ID pesanan
   * @returns Promise<boolean> - true jika applied sudah selesai
   */
  async isCompleted(orderId: string): Promise<boolean> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      if (!progress) return false;

      const appliedData = progress.data as unknown as AppliedData;
      return appliedData.est_applied_area > 0;
    } catch (error) {
      console.error("Error checking applied completion:", error);
      return false;
    }
  }

  /**
   * Get application efficiency
   * 
   * @param orderId - ID pesanan
   * @returns Promise<number | null> - Persentase efisiensi aplikasi
   */
  async getApplicationEfficiency(orderId: string): Promise<number | null> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      if (!progress) return null;

      const appliedData = progress.data as unknown as AppliedData;
      if (!appliedData.actual_applied_area) return null;

      const efficiency = (appliedData.actual_applied_area / appliedData.est_applied_area) * 100;
      return Math.round(efficiency * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error("Error calculating application efficiency:", error);
      return null;
    }
  }

  /**
   * Get area variance
   * 
   * @param orderId - ID pesanan
   * @returns Promise<number | null> - Selisih area dalam satuan yang sama
   */
  async getAreaVariance(orderId: string): Promise<number | null> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      if (!progress) return null;

      const appliedData = progress.data as unknown as AppliedData;
      if (!appliedData.actual_applied_area) return null;

      return appliedData.actual_applied_area - appliedData.est_applied_area;
    } catch (error) {
      console.error("Error calculating area variance:", error);
      return null;
    }
  }
}

// Export instance untuk digunakan di tempat lain
export const appliedProgressService = new AppliedProgressService();
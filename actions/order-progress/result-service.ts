"use server";

/**
 * Result Progress Service
 * 
 * Modul ini menangani semua operasi yang berkaitan dengan progress result.
 * Mengimplementasikan prinsip Single Responsibility dan Dependency Injection.
 * 
 * Fitur:
 * - Create result progress
 * - Update result progress
 * - Get result progress data
 * - Delete result progress
 * - Validasi khusus result (yield gain dan amount)
 * - Logika bisnis result (applied prerequisite)
 * - Analisis hasil dan ROI
 */

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { ResultProgressSchema } from "@/schema/order-progress";
import { 
  OrderProgressResponse, 
  ResultData, 
  ProgressInput,
  BaseProgressService,
  AppliedData 
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
 * Result Progress Service Class
 * 
 * Implementasi service untuk mengelola result progress dengan
 * logika bisnis yang terisolasi dan interface yang jelas.
 */
export class ResultProgressService implements BaseProgressService {
  private readonly stage = "result";

  /**
   * Validasi data result sebelum disimpan
   * 
   * @param data - Data result yang akan divalidasi
   * @throws Error jika validasi gagal
   */
  private validateResultData(data: ResultData): void {
    // Validasi status (wajib)
    if (typeof data.status !== 'boolean') {
      throw new Error("Status must be boolean");
    }

    // Validasi yield_amount (opsional, tapi wajib jika status true)
    if (data.status && data.yield_amount === undefined) {
      throw new Error("Yield amount is required when status is true");
    }

    if (data.yield_amount !== undefined) {
      if (typeof data.yield_amount !== 'number') {
        throw new Error("Yield amount must be a number");
      }

      if (data.yield_amount < 0) {
        throw new Error("Yield amount cannot be negative");
      }

      if (data.yield_amount > 1000000) {
        throw new Error("Yield amount cannot exceed 1,000,000");
      }

      // Jika status false, yield_amount harus 0 atau undefined
      if (!data.status && data.yield_amount > 0) {
        throw new Error("Yield amount must be 0 when status is false");
      }
    }

    // Validasi notes
    if (data.notes && typeof data.notes !== 'string') {
      throw new Error("Result notes must be string");
    }

    if (data.notes && data.notes.length > 500) {
      throw new Error("Result notes cannot exceed 500 characters");
    }
  }

  /**
   * Logika bisnis khusus result
   * 
   * Menentukan apakah result progress dapat dibuat berdasarkan:
   * - Applied progress harus sudah selesai
   * - Tidak boleh ada progress result sebelumnya
   * 
   * @param orderId - ID pesanan
   * @throws Error jika kondisi tidak terpenuhi
   */
  private async validateResultBusinessRules(orderId: string): Promise<void> {
    // Cek apakah sudah ada progress result
    const hasExisting = await checkExistingProgress(orderId, this.stage);
    if (hasExisting) {
      throw new Error(`Progress for ${this.stage} stage already exists`);
    }

    // Cek apakah applied progress sudah selesai
    const appliedProgress = await getStageProgressData(orderId, "applied");
    if (!appliedProgress) {
      throw new Error("Applied progress must be completed before result");
    }

    const appliedData = appliedProgress.data as unknown as AppliedData;
    if (!appliedData.est_applied_area || appliedData.est_applied_area <= 0) {
      throw new Error("Applied area must be greater than 0 before result");
    }
  }

  /**
   * Create result progress
   * 
   * @param input - Data input untuk result progress
   * @returns Promise<OrderProgressResponse> - Response dengan data progress yang dibuat
   */
  async create(input: ProgressInput): Promise<OrderProgressResponse> {
    try {
      // Validasi order
      await validateOrder(input.order_id);

      // Validasi dengan schema Zod
      const validatedData = ResultProgressSchema.parse(input);

      // Validasi data result
      this.validateResultData(validatedData.data as ResultData);

      // Validasi business rules
      await this.validateResultBusinessRules(input.order_id);

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
        message: `Result progress created successfully`,
      };
    } catch (error) {
      console.error("Error creating result progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create result progress",
      };
    }
  }

  /**
   * Update result progress
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
      const validatedData = ResultProgressSchema.parse(input);

      // Validasi data result
      this.validateResultData(validatedData.data as ResultData);

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
        message: `Result progress updated successfully`,
      };
    } catch (error) {
      console.error("Error updating result progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update result progress",
      };
    }
  }

  /**
   * Get result progress data
   * 
   * @param orderId - ID pesanan
   * @returns Promise<OrderProgressResponse> - Response dengan data result progress
   */
  async get(orderId: string): Promise<OrderProgressResponse> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      
      return {
        success: true,
        data: progress,
        message: progress ? "Result progress found" : "No result progress found",
      };
    } catch (error) {
      console.error("Error getting result progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get result progress",
      };
    }
  }

  /**
   * Delete result progress
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
        throw new Error("Result progress not found");
      }

      // Delete progress
      const deleted = await deleteProgressById(id);
      
      if (!deleted) {
        throw new Error("Failed to delete result progress");
      }

      // Update order status after deletion
      await updateOrderStatus(progress.order_id);

      // Revalidate cache
      revalidateOrderPages(progress.order_id);

      return {
        success: true,
        message: "Result progress deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting result progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete result progress",
      };
    }
  }

  /**
   * Check if result is completed
   * 
   * @param orderId - ID pesanan
   * @returns Promise<boolean> - true jika result sudah selesai
   */
  async isCompleted(orderId: string): Promise<boolean> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      if (!progress) return false;

      const resultData = progress.data as unknown as ResultData;
      return typeof resultData.status === 'boolean';
    } catch (error) {
      console.error("Error checking result completion:", error);
      return false;
    }
  }

  /**
   * Check if yield was gained
   * 
   * @param orderId - ID pesanan
   * @returns Promise<boolean> - true jika ada yield gain
   */
  async hasYieldGain(orderId: string): Promise<boolean> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      if (!progress) return false;

      const resultData = progress.data as unknown as ResultData;
      return resultData.status === true;
    } catch (error) {
      console.error("Error checking yield gain:", error);
      return false;
    }
  }

  /**
   * Get yield per area ratio
   * 
   * @param orderId - ID pesanan
   * @returns Promise<number | null> - Yield per unit area
   */
  async getYieldPerArea(orderId: string): Promise<number | null> {
    try {
      const resultProgress = await getStageProgressData(orderId, this.stage);
      const appliedProgress = await getStageProgressData(orderId, "applied");
      
      if (!resultProgress || !appliedProgress) return null;

      const resultData = resultProgress.data as unknown as ResultData;
      const appliedData = appliedProgress.data as unknown as AppliedData;

      if (!resultData.yield_amount || !appliedData.actual_applied_area) return null;

      const yieldPerArea = resultData.yield_amount / appliedData.actual_applied_area;
      return Math.round(yieldPerArea * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error("Error calculating yield per area:", error);
      return null;
    }
  }

  /**
   * Get comprehensive result analysis
   * 
   * @param orderId - ID pesanan
   * @returns Promise<object | null> - Analisis lengkap hasil
   */
  async getResultAnalysis(orderId: string): Promise<{
    hasYield: boolean;
    yieldAmount: number | null;
    appliedArea: number | null;
    yieldPerArea: number | null;
    efficiency: 'high' | 'medium' | 'low' | null;
  } | null> {
    try {
      const resultProgress = await getStageProgressData(orderId, this.stage);
      const appliedProgress = await getStageProgressData(orderId, "applied");
      
      if (!resultProgress || !appliedProgress) return null;

      const resultData = resultProgress.data as unknown as ResultData;
      const appliedData = appliedProgress.data as unknown as AppliedData;

      const yieldPerArea = await this.getYieldPerArea(orderId);
      
      let efficiency: 'high' | 'medium' | 'low' | null = null;
      if (yieldPerArea !== null) {
        if (yieldPerArea >= 10) efficiency = 'high';
        else if (yieldPerArea >= 5) efficiency = 'medium';
        else efficiency = 'low';
      }

      return {
        hasYield: resultData.status,
        yieldAmount: resultData.yield_amount || null,
        appliedArea: appliedData.actual_applied_area || appliedData.est_applied_area,
        yieldPerArea,
        efficiency
      };
    } catch (error) {
      console.error("Error getting result analysis:", error);
      return null;
    }
  }
}

// Export instance untuk digunakan di tempat lain
export const resultProgressService = new ResultProgressService();
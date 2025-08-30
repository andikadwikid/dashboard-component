"use server";

/**
 * Warehouse Progress Service
 * 
 * Modul ini menangani semua operasi yang berkaitan dengan progress warehouse.
 * Mengimplementasikan prinsip Single Responsibility dan Dependency Injection.
 * 
 * Fitur:
 * - Create warehouse progress
 * - Update warehouse progress
 * - Get warehouse progress data
 * - Delete warehouse progress
 * - Validasi khusus warehouse
 */

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { WarehouseProgressSchema } from "@/schema/order-progress";
import { 
  OrderProgressResponse, 
  WarehouseData, 
  ProgressInput,
  BaseProgressService 
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
 * Warehouse Progress Service Class
 * 
 * Implementasi service untuk mengelola warehouse progress dengan
 * logika bisnis yang terisolasi dan interface yang jelas.
 */
export class WarehouseProgressService implements BaseProgressService {
  private readonly stage = "warehouse";

  /**
   * Validasi data warehouse sebelum disimpan
   * 
   * @param data - Data warehouse yang akan divalidasi
   * @throws Error jika validasi gagal
   */
  private validateWarehouseData(data: WarehouseData): void {
    if (typeof data.status !== 'boolean') {
      throw new Error("Warehouse status must be boolean");
    }

    if (data.notes && typeof data.notes !== 'string') {
      throw new Error("Warehouse notes must be string");
    }

    if (data.notes && data.notes.length > 500) {
      throw new Error("Warehouse notes cannot exceed 500 characters");
    }
  }

  /**
   * Logika bisnis khusus warehouse
   * 
   * Menentukan apakah warehouse progress dapat dibuat berdasarkan:
   * - Status order harus valid
   * - Tidak boleh ada progress warehouse sebelumnya
   * 
   * @param orderId - ID pesanan
   * @throws Error jika kondisi tidak terpenuhi
   */
  private async validateWarehouseBusinessRules(orderId: string): Promise<void> {
    // Cek apakah sudah ada progress warehouse
    const hasExisting = await checkExistingProgress(orderId, this.stage);
    if (hasExisting) {
      throw new Error(`Progress for ${this.stage} stage already exists`);
    }
  }

  /**
   * Create warehouse progress
   * 
   * @param input - Data input untuk warehouse progress
   * @returns Promise<OrderProgressResponse> - Response dengan data progress yang dibuat
   */
  async create(input: ProgressInput): Promise<OrderProgressResponse> {
    try {
      // Validasi order
      await validateOrder(input.order_id);

      // Validasi dengan schema Zod
      const validatedData = WarehouseProgressSchema.parse(input);

      // Validasi data warehouse
      this.validateWarehouseData(validatedData.data as WarehouseData);

      // Validasi business rules
      await this.validateWarehouseBusinessRules(input.order_id);

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
        message: `Warehouse progress created successfully`,
      };
    } catch (error) {
      console.error("Error creating warehouse progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create warehouse progress",
      };
    }
  }

  /**
   * Update warehouse progress
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
      const validatedData = WarehouseProgressSchema.parse(input);

      // Validasi data warehouse
      this.validateWarehouseData(validatedData.data as WarehouseData);

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
        message: `Warehouse progress updated successfully`,
      };
    } catch (error) {
      console.error("Error updating warehouse progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update warehouse progress",
      };
    }
  }

  /**
   * Get warehouse progress data
   * 
   * @param orderId - ID pesanan
   * @returns Promise<OrderProgressResponse> - Response dengan data warehouse progress
   */
  async get(orderId: string): Promise<OrderProgressResponse> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      
      return {
        success: true,
        data: progress,
        message: progress ? "Warehouse progress found" : "No warehouse progress found",
      };
    } catch (error) {
      console.error("Error getting warehouse progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get warehouse progress",
      };
    }
  }

  /**
   * Delete warehouse progress
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
        throw new Error("Warehouse progress not found");
      }

      // Delete progress
      const deleted = await deleteProgressById(id);
      
      if (!deleted) {
        throw new Error("Failed to delete warehouse progress");
      }

      // Update order status after deletion
      await updateOrderStatus(progress.order_id);

      // Revalidate cache
      revalidateOrderPages(progress.order_id);

      return {
        success: true,
        message: "Warehouse progress deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting warehouse progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete warehouse progress",
      };
    }
  }

  /**
   * Check if warehouse is completed
   * 
   * @param orderId - ID pesanan
   * @returns Promise<boolean> - true jika warehouse sudah selesai
   */
  async isCompleted(orderId: string): Promise<boolean> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      if (!progress) return false;

      const warehouseData = progress.data as unknown as WarehouseData;
      return warehouseData.status === true;
    } catch (error) {
      console.error("Error checking warehouse completion:", error);
      return false;
    }
  }
}

// Export instance untuk digunakan di tempat lain
export const warehouseProgressService = new WarehouseProgressService();
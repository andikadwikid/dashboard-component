"use server";

/**
 * Shipping Progress Service
 * 
 * Modul ini menangani semua operasi yang berkaitan dengan progress shipping.
 * Mengimplementasikan prinsip Single Responsibility dan Dependency Injection.
 * 
 * Fitur:
 * - Create shipping progress
 * - Update shipping progress
 * - Get shipping progress data
 * - Delete shipping progress
 * - Validasi khusus shipping (tanggal, status)
 * - Logika bisnis shipping (warehouse prerequisite)
 */

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { ShippingProgressSchema } from "@/schema/order-progress";
import { 
  OrderProgressResponse, 
  ShippingData, 
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
 * Shipping Progress Service Class
 * 
 * Implementasi service untuk mengelola shipping progress dengan
 * logika bisnis yang terisolasi dan interface yang jelas.
 */
export class ShippingProgressService implements BaseProgressService {
  private readonly stage = "shipping";

  /**
   * Validasi data shipping sebelum disimpan
   * 
   * @param data - Data shipping yang akan divalidasi
   * @throws Error jika validasi gagal
   */
  private validateShippingData(data: ShippingData): void {
    if (typeof data.status !== 'boolean') {
      throw new Error("Shipping status must be boolean");
    }

    // Validasi tanggal shipping
    if (data.date_shipping) {
      const shippingDate = new Date(data.date_shipping);
      if (isNaN(shippingDate.getTime())) {
        throw new Error("Invalid shipping date format");
      }
      
      // Tanggal shipping tidak boleh di masa depan
      if (shippingDate > new Date()) {
        throw new Error("Shipping date cannot be in the future");
      }
    }

    // Validasi tanggal received
    if (data.date_received) {
      const receivedDate = new Date(data.date_received);
      if (isNaN(receivedDate.getTime())) {
        throw new Error("Invalid received date format");
      }
      
      // Tanggal received tidak boleh di masa depan
      if (receivedDate > new Date()) {
        throw new Error("Received date cannot be in the future");
      }

      // Jika ada tanggal shipping, received harus setelah shipping
      if (data.date_shipping) {
        const shippingDate = new Date(data.date_shipping);
        if (receivedDate < shippingDate) {
          throw new Error("Received date must be after shipping date");
        }
      }
    }

    // Validasi notes
    if (data.notes && typeof data.notes !== 'string') {
      throw new Error("Shipping notes must be string");
    }

    if (data.notes && data.notes.length > 500) {
      throw new Error("Shipping notes cannot exceed 500 characters");
    }

    // Validasi logika bisnis shipping
    if (data.status && !data.date_shipping) {
      throw new Error("Shipping date is required when status is true");
    }

    if (data.date_received && !data.status) {
      throw new Error("Shipping status must be true when received date is provided");
    }
  }

  /**
   * Logika bisnis khusus shipping
   * 
   * Menentukan apakah shipping progress dapat dibuat berdasarkan:
   * - Warehouse progress harus sudah selesai
   * - Tidak boleh ada progress shipping sebelumnya
   * 
   * @param orderId - ID pesanan
   * @throws Error jika kondisi tidak terpenuhi
   */
  private async validateShippingBusinessRules(orderId: string): Promise<void> {
    // Cek apakah sudah ada progress shipping
    const hasExisting = await checkExistingProgress(orderId, this.stage);
    if (hasExisting) {
      throw new Error(`Progress for ${this.stage} stage already exists`);
    }

    // Cek apakah warehouse progress sudah selesai
    const warehouseProgress = await getStageProgressData(orderId, "warehouse");
    if (!warehouseProgress) {
      throw new Error("Warehouse progress must be completed before shipping");
    }

    const warehouseData = warehouseProgress.data as unknown as { status: boolean };
    if (!warehouseData.status) {
      throw new Error("Warehouse must be completed before shipping");
    }
  }

  /**
   * Create shipping progress
   * 
   * @param input - Data input untuk shipping progress
   * @returns Promise<OrderProgressResponse> - Response dengan data progress yang dibuat
   */
  async create(input: ProgressInput): Promise<OrderProgressResponse> {
    try {
      // Validasi order
      await validateOrder(input.order_id);

      // Validasi dengan schema Zod
      const validatedData = ShippingProgressSchema.parse(input);

      // Validasi data shipping
      this.validateShippingData(validatedData.data as ShippingData);

      // Validasi business rules
      await this.validateShippingBusinessRules(input.order_id);

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
        message: `Shipping progress created successfully`,
      };
    } catch (error) {
      console.error("Error creating shipping progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create shipping progress",
      };
    }
  }

  /**
   * Update shipping progress
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
      const validatedData = ShippingProgressSchema.parse(input);

      // Validasi data shipping
      this.validateShippingData(validatedData.data as ShippingData);

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
        message: `Shipping progress updated successfully`,
      };
    } catch (error) {
      console.error("Error updating shipping progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update shipping progress",
      };
    }
  }

  /**
   * Get shipping progress data
   * 
   * @param orderId - ID pesanan
   * @returns Promise<OrderProgressResponse> - Response dengan data shipping progress
   */
  async get(orderId: string): Promise<OrderProgressResponse> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      
      return {
        success: true,
        data: progress,
        message: progress ? "Shipping progress found" : "No shipping progress found",
      };
    } catch (error) {
      console.error("Error getting shipping progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get shipping progress",
      };
    }
  }

  /**
   * Delete shipping progress
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
        throw new Error("Shipping progress not found");
      }

      // Cek apakah ada progress yang bergantung pada shipping
      const dependentProgress = await db.orderProgress.findFirst({
        where: {
          order_id: progress.order_id,
          stage: { in: ["applied", "result"] }
        }
      });

      if (dependentProgress) {
        throw new Error("Cannot delete shipping progress. Applied or Result progress exists.");
      }

      // Delete progress
      const deleted = await deleteProgressById(id);
      
      if (!deleted) {
        throw new Error("Failed to delete shipping progress");
      }

      // Update order status after deletion
      await updateOrderStatus(progress.order_id);

      // Revalidate cache
      revalidateOrderPages(progress.order_id);

      return {
        success: true,
        message: "Shipping progress deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting shipping progress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete shipping progress",
      };
    }
  }

  /**
   * Check if shipping is completed
   * 
   * @param orderId - ID pesanan
   * @returns Promise<boolean> - true jika shipping sudah selesai
   */
  async isCompleted(orderId: string): Promise<boolean> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      if (!progress) return false;

      const shippingData = progress.data as unknown as ShippingData;
      return shippingData.status === true && !!shippingData.date_shipping;
    } catch (error) {
      console.error("Error checking shipping completion:", error);
      return false;
    }
  }

  /**
   * Check if item is delivered
   * 
   * @param orderId - ID pesanan
   * @returns Promise<boolean> - true jika barang sudah diterima
   */
  async isDelivered(orderId: string): Promise<boolean> {
    try {
      const progress = await getStageProgressData(orderId, this.stage);
      if (!progress) return false;

      const shippingData = progress.data as unknown as ShippingData;
      return !!shippingData.date_received;
    } catch (error) {
      console.error("Error checking delivery status:", error);
      return false;
    }
  }
}

// Export instance untuk digunakan di tempat lain
export const shippingProgressService = new ShippingProgressService();
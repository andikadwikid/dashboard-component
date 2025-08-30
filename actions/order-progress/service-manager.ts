"use server";

/**
 * Order Progress Service Manager
 * 
 * Modul ini berfungsi sebagai facade pattern untuk mengintegrasikan semua
 * service modular order progress. Menyediakan interface terpusat untuk
 * mengakses semua operasi order progress dengan dependency injection.
 * 
 * Implementasi prinsip SOLID:
 * - Single Responsibility: Hanya mengelola koordinasi antar service
 * - Open/Closed: Mudah diperluas dengan service baru tanpa mengubah kode existing
 * - Liskov Substitution: Semua service mengimplementasikan BaseProgressService
 * - Interface Segregation: Interface yang spesifik untuk setiap kebutuhan
 * - Dependency Inversion: Bergantung pada abstraksi, bukan implementasi konkret
 */

import { 
  OrderProgressResponse, 
  ProgressInput,
  BaseProgressService,
  ServiceDependencies,
  ProgressStage
} from "./types";
import { WarehouseProgressService } from "./warehouse-service";
import { ShippingProgressService } from "./shipping-service";
import { AppliedProgressService } from "./applied-service";
import { ResultProgressService } from "./result-service";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Service Manager Class
 * 
 * Kelas utama yang mengelola semua service order progress.
 * Mengimplementasikan facade pattern untuk menyederhanakan akses ke service.
 */
export class OrderProgressServiceManager {
  private readonly services: Map<string, BaseProgressService>;
  private readonly dependencies: ServiceDependencies;

  constructor() {
    // Setup dependencies
    this.dependencies = {
      db,
      revalidatePath
    };

    // Initialize all services
    this.services = new Map<string, BaseProgressService>();
    this.services.set('warehouse', new WarehouseProgressService());
    this.services.set('shipping', new ShippingProgressService());
    this.services.set('applied', new AppliedProgressService());
    this.services.set('result', new ResultProgressService());
  }

  /**
   * Get service untuk tahapan tertentu
   * 
   * @param stage - Tahapan progress
   * @returns Service instance untuk tahapan tersebut
   * @throws Error jika tahapan tidak valid
   */
  private getService(stage: ProgressStage): BaseProgressService {
    const service = this.services.get(stage);
    if (!service) {
      throw new Error(`Service for stage '${stage}' not found`);
    }
    return service;
  }

  /**
   * Create progress untuk tahapan tertentu
   * 
   * @param input - Data input progress
   * @returns Promise<OrderProgressResponse> - Response hasil create
   */
  async createProgress(input: ProgressInput): Promise<OrderProgressResponse> {
    try {
      const service = this.getService(input.stage as ProgressStage);
      return await service.create(input);
    } catch (error) {
      console.error(`Error creating progress for stage ${input.stage}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create progress"
      };
    }
  }

  /**
   * Update progress untuk tahapan tertentu
   * 
   * @param id - ID progress yang akan diupdate
   * @param input - Data input untuk update
   * @returns Promise<OrderProgressResponse> - Response hasil update
   */
  async updateProgress(id: string, input: ProgressInput): Promise<OrderProgressResponse> {
    try {
      const service = this.getService(input.stage as ProgressStage);
      return await service.update(id, input);
    } catch (error) {
      console.error(`Error updating progress for stage ${input.stage}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update progress"
      };
    }
  }

  /**
   * Get progress untuk tahapan tertentu
   * 
   * @param orderId - ID pesanan
   * @param stage - Tahapan progress
   * @returns Promise<OrderProgressResponse> - Response dengan data progress
   */
  async getProgress(orderId: string, stage: ProgressStage): Promise<OrderProgressResponse> {
    try {
      const service = this.getService(stage);
      return await service.get(orderId);
    } catch (error) {
      console.error(`Error getting progress for stage ${stage}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get progress"
      };
    }
  }

  /**
   * Delete progress untuk tahapan tertentu
   * 
   * @param id - ID progress yang akan dihapus
   * @param stage - Tahapan progress
   * @returns Promise<OrderProgressResponse> - Response hasil delete
   */
  async deleteProgress(id: string, stage: ProgressStage): Promise<OrderProgressResponse> {
    try {
      const service = this.getService(stage);
      return await service.delete(id);
    } catch (error) {
      console.error(`Error deleting progress for stage ${stage}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete progress"
      };
    }
  }

  /**
   * Check apakah tahapan sudah completed
   * 
   * @param orderId - ID pesanan
   * @param stage - Tahapan progress
   * @returns Promise<boolean> - true jika sudah completed
   */
  async isStageCompleted(orderId: string, stage: ProgressStage): Promise<boolean> {
    try {
      const service = this.getService(stage);
      return await service.isCompleted(orderId);
    } catch (error) {
      console.error(`Error checking completion for stage ${stage}:`, error);
      return false;
    }
  }

  /**
   * Get status completion untuk semua tahapan
   * 
   * @param orderId - ID pesanan
   * @returns Promise<Record<ProgressStage, boolean>> - Status completion semua tahapan
   */
  async getAllStagesStatus(orderId: string): Promise<Record<ProgressStage, boolean>> {
    const stages: ProgressStage[] = ['warehouse', 'shipping', 'applied', 'result'];
    const statusPromises = stages.map(async (stage) => {
      const isCompleted = await this.isStageCompleted(orderId, stage);
      return [stage, isCompleted] as [ProgressStage, boolean];
    });

    const results = await Promise.all(statusPromises);
    return Object.fromEntries(results) as Record<ProgressStage, boolean>;
  }

  /**
   * Get next available stage untuk order
   * 
   * @param orderId - ID pesanan
   * @returns Promise<ProgressStage | null> - Tahapan berikutnya yang bisa diakses atau null jika semua selesai
   */
  async getNextAvailableStage(orderId: string): Promise<ProgressStage | null> {
    const stages: ProgressStage[] = ['warehouse', 'shipping', 'applied', 'result'];
    
    for (const stage of stages) {
      const isCompleted = await this.isStageCompleted(orderId, stage);
      if (!isCompleted) {
        return stage;
      }
    }
    
    return null; // Semua tahapan sudah selesai
  }

  /**
   * Validate prerequisites untuk tahapan tertentu
   * 
   * @param orderId - ID pesanan
   * @param stage - Tahapan yang akan divalidasi
   * @returns Promise<boolean> - true jika prerequisites terpenuhi
   */
  async validatePrerequisites(orderId: string, stage: ProgressStage): Promise<boolean> {
    const stageOrder: ProgressStage[] = ['warehouse', 'shipping', 'applied', 'result'];
    const currentIndex = stageOrder.indexOf(stage);
    
    if (currentIndex === 0) {
      return true; // Warehouse tidak memiliki prerequisite
    }
    
    // Check semua tahapan sebelumnya sudah completed
    for (let i = 0; i < currentIndex; i++) {
      const isCompleted = await this.isStageCompleted(orderId, stageOrder[i]);
      if (!isCompleted) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get progress summary untuk order
   * 
   * @param orderId - ID pesanan
   * @returns Promise<object> - Summary lengkap progress order
   */
  async getProgressSummary(orderId: string): Promise<{
    orderId: string;
    completedStages: ProgressStage[];
    currentStage: ProgressStage | null;
    nextStage: ProgressStage | null;
    overallProgress: number;
    isCompleted: boolean;
  }> {
    const allStatus = await this.getAllStagesStatus(orderId);
    const stages: ProgressStage[] = ['warehouse', 'shipping', 'applied', 'result'];
    
    const completedStages = stages.filter(stage => allStatus[stage]);
    const currentStage = await this.getNextAvailableStage(orderId);
    const nextStageIndex = currentStage ? stages.indexOf(currentStage) + 1 : -1;
    const nextStage = nextStageIndex >= 0 && nextStageIndex < stages.length ? stages[nextStageIndex] : null;
    
    const overallProgress = (completedStages.length / stages.length) * 100;
    const isCompleted = completedStages.length === stages.length;
    
    return {
      orderId,
      completedStages,
      currentStage,
      nextStage,
      overallProgress: Math.round(overallProgress),
      isCompleted
    };
  }

  /**
   * Bulk operations untuk multiple orders
   * 
   * @param orderIds - Array ID pesanan
   * @returns Promise<Record<string, object>> - Summary untuk setiap order
   */
  async getBulkProgressSummary(orderIds: string[]): Promise<Record<string, object>> {
    const summaryPromises = orderIds.map(async (orderId) => {
      const summary = await this.getProgressSummary(orderId);
      return [orderId, summary] as [string, object];
    });
    
    const results = await Promise.all(summaryPromises);
    return Object.fromEntries(results);
  }
}

// Export singleton instance
export const orderProgressManager = new OrderProgressServiceManager();

// Export individual services untuk akses langsung jika diperlukan
export {
  WarehouseProgressService,
  ShippingProgressService,
  AppliedProgressService,
  ResultProgressService
};

// Export service instances
export const warehouseService = new WarehouseProgressService();
export const shippingService = new ShippingProgressService();
export const appliedService = new AppliedProgressService();
export const resultService = new ResultProgressService();
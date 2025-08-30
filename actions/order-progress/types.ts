/**
 * Order Progress Types
 * 
 * File ini berisi definisi tipe data yang digunakan di seluruh modul order progress.
 * Memisahkan tipe data untuk memudahkan maintenance dan konsistensi.
 */

import { OrderStatus, Prisma } from "@prisma/client";
import { ProgressStage as SchemaProgressStage } from "@/schema/order-progress";

/**
 * Interface untuk response standar dari semua operasi order progress
 */
export interface OrderProgressResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Interface untuk data order progress
 */
export interface OrderProgressData {
  id: string;
  order_id: string;
  stage: ProgressStage;
  data: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Interface untuk input data progress
 */
export interface ProgressInput {
  order_id: string;
  stage: ProgressStage;
  data: Record<string, unknown>;
}

/**
 * Interface untuk status tahapan progress
 */
export interface StageStatus {
  warehouse: boolean;
  shipping: boolean;
  applied: boolean;
  result: boolean;
}

/**
 * Interface untuk data warehouse progress
 */
export interface WarehouseData {
  status: boolean;
  notes?: string;
}

/**
 * Interface untuk data shipping progress
 */
export interface ShippingData {
  status: boolean;
  date_shipping?: string;
  date_received?: string;
  notes?: string;
}

/**
 * Interface untuk data applied progress
 */
export interface AppliedData {
  est_applied_area: number;
  actual_applied_area?: number;
  notes?: string;
}

/**
 * Interface untuk data result progress
 */
export interface ResultData {
  status: boolean;
  yield_amount?: number;
  notes?: string;
}

/**
 * Interface untuk service dependencies
 */
export interface ServiceDependencies {
  db: typeof import('@/lib/db').db;
  revalidatePath: (path: string) => void;
}

/**
 * Union type untuk semua data tahapan
 */
export type ProgressData = WarehouseData | ShippingData | AppliedData | ResultData;

/**
 * Type untuk tahapan progress
 */
export type ProgressStage = "warehouse" | "shipping" | "applied" | "result";

/**
 * Interface untuk base service
 */
export interface BaseProgressService {
  create(input: ProgressInput): Promise<OrderProgressResponse>;
  update(id: string, input: ProgressInput): Promise<OrderProgressResponse>;
  get(orderId: string): Promise<OrderProgressResponse>;
  delete(id: string): Promise<OrderProgressResponse>;
  isCompleted(orderId: string): Promise<boolean>;
}
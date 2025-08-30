/**
 * Order Progress Schema Definitions
 *
 * File ini berisi semua schema validasi Zod untuk sistem order progress.
 * Schema ini digunakan untuk memvalidasi input data pada setiap tahapan progres pesanan.
 *
 * Tahapan yang didukung:
 * 1. warehouse - Tahapan gudang dengan status boolean
 * 2. shipping - Tahapan pengiriman dengan status dan tanggal
 * 3. applied - Tahapan aplikasi dengan estimasi area
 * 4. result - Tahapan hasil dengan yield result dan amount
 *
 * Dependencies:
 * - zod: Library untuk schema validation dan type inference
 */

import { z } from "zod";

/**
 * Base schema untuk order progress
 *
 * Schema dasar yang mendefinisikan struktur umum untuk semua tahapan progres.
 * Digunakan sebagai fallback untuk validasi umum.
 *
 * @property {string} order_id - ID pesanan (required, minimal 1 karakter)
 * @property {"warehouse"|"shipping"|"applied"|"result"} stage - Tahapan progres
 * @property {Record<string, any>} data - Data progres (flexible object)
 */
export const OrderProgressSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  stage: z.enum(["warehouse", "shipping", "applied", "result"]),
  data: z.record(z.string(), z.any()),
});

/**
 * Schema untuk tahapan Warehouse
 *
 * Validasi data untuk tahapan gudang dalam order progress.
 * Tahapan ini dianggap selesai jika status = true.
 *
 * @property {string} order_id - ID pesanan
 * @property {"warehouse"} stage - Literal "warehouse"
 * @property {Object} data - Data warehouse
 * @property {boolean} data.status - Status kesiapan warehouse
 */
export const WarehouseProgressSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  stage: z.literal("warehouse"),
  data: z.object({
    status: z.boolean(),
  }),
});

/**
 * Schema untuk tahapan Shipping
 *
 * Validasi data untuk tahapan pengiriman dalam order progress.
 * Tahapan ini dianggap selesai jika status = true dan kedua tanggal telah terisi.
 *
 * @property {string} order_id - ID pesanan
 * @property {"shipping"} stage - Literal "shipping"
 * @property {Object} data - Data shipping
 * @property {boolean} data.status - Status pengiriman
 * @property {string} [data.date_shipping] - Tanggal pengiriman (required when status is true)
 * @property {string} [data.date_received] - Tanggal penerimaan barang (required when status is true)
 */
export const ShippingProgressSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  stage: z.literal("shipping"),
  data: z.object({
    status: z.boolean(),
    date_shipping: z.string().optional(),
    date_received: z.string().optional(),
  }),
});

/**
 * Schema untuk tahapan Applied
 *
 * Validasi data untuk tahapan aplikasi dalam order progress.
 * Tahapan ini dianggap selesai jika est_applied_area > 0.
 *
 * @property {string} order_id - ID pesanan
 * @property {"applied"} stage - Literal "applied"
 * @property {Object} data - Data applied
 * @property {number} data.est_applied_area - Estimasi area yang diaplikasikan (harus positif)
 * @property {number} [data.actual_applied_area] - Luas area aktual yang telah diaplikasikan dalam hektar (optional)
 */
export const AppliedProgressSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  stage: z.literal("applied"),
  data: z.object({
    est_applied_area: z.number().positive("Applied area must be positive"),
    actual_applied_area: z.number().positive("Actual applied area must be positive").optional(),
  }),
});

/**
 * Schema untuk tahapan Result
 * 
 * Validasi data untuk tahapan hasil dalam order progress.
 * Tahapan ini dianggap selesai jika status = true.
 *
 * @property {string} order_id - ID pesanan
 * @property {"result"} stage - Literal "result"
 * @property {Object} data - Data result
 * @property {boolean} data.status - Status hasil (true untuk gain, false untuk no_gain)
 * @property {number} [data.yield_amount] - Jumlah yield (optional, biasanya untuk gain)
 */
export const ResultProgressSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  stage: z.literal("result"),
  data: z.object({
    status: z.boolean(),
    yield_amount: z.number().optional(),
  }),
});

/**
 * Union schema untuk semua tahapan progress
 *
 * Schema gabungan yang dapat memvalidasi data untuk semua tahapan.
 * Berguna untuk validasi dinamis berdasarkan stage yang diterima.
 *
 * @type {ZodUnion} Union dari semua progress schemas
 */
export const AnyProgressSchema = z.union([
  WarehouseProgressSchema,
  ShippingProgressSchema,
  AppliedProgressSchema,
  ResultProgressSchema,
]);

/**
 * Type definitions yang di-infer dari Zod schemas
 *
 * Types ini secara otomatis di-generate dari schema Zod dan menyediakan
 * type safety untuk TypeScript. Gunakan types ini untuk parameter function,
 * state management, dan validasi compile-time.
 */
export type OrderProgress = z.infer<typeof OrderProgressSchema>;
export type WarehouseProgress = z.infer<typeof WarehouseProgressSchema>;
export type ShippingProgress = z.infer<typeof ShippingProgressSchema>;
export type AppliedProgress = z.infer<typeof AppliedProgressSchema>;
export type ResultProgress = z.infer<typeof ResultProgressSchema>;
export type AnyProgress = z.infer<typeof AnyProgressSchema>;

/**
 * Type untuk tahapan progress
 *
 * Union type yang mendefinisikan semua tahapan yang valid dalam sistem.
 * Digunakan untuk type checking dan validasi tahapan.
 */
export type ProgressStage = "warehouse" | "shipping" | "applied" | "result";

/**
 * Interface untuk data setiap tahapan
 *
 * Interfaces ini mendefinisikan struktur data yang disimpan untuk setiap tahapan.
 * Digunakan untuk type checking dan intellisense dalam development.
 */

/**
 * Data interface untuk tahapan Warehouse
 * @property {boolean} status - Status kesiapan warehouse
 */
export interface WarehouseData {
  status: boolean;
}

/**
 * Data interface untuk tahapan Shipping
 * @property {boolean} status - Status pengiriman
 * @property {string} [date_shipping] - Tanggal pengiriman (optional)
 */
export interface ShippingData {
  status: boolean;
  date_shipping?: string;
  date_received?: string;
}

/**
 * Data interface untuk tahapan Applied
 * @property {number} est_applied_area - Estimasi area yang diaplikasikan
 * @property {number} [actual_applied_area] - Area aktual yang diaplikasikan (optional)
 */
export interface AppliedData {
  est_applied_area: number;
  actual_applied_area?: number;
}

/**
 * Data interface untuk tahapan Result
 * @property {boolean} status - Status hasil (true untuk gain, false untuk no_gain)
 * @property {number} [yield_amount] - Jumlah yield (optional)
 */
export interface ResultData {
  status: boolean;
  yield_amount?: number;
}

/**
 * Union type untuk semua data tahapan
 *
 * Type gabungan yang dapat merepresentasikan data dari tahapan manapun.
 * Berguna untuk function yang menangani multiple tahapan.
 */
export type ProgressData =
  | WarehouseData
  | ShippingData
  | AppliedData
  | ResultData;

"use server";

/**
 * Base Service untuk Order Progress
 * 
 * Service ini berisi logika umum yang digunakan oleh semua modul progress.
 * Mengimplementasikan prinsip DRY (Don't Repeat Yourself) dan Single Responsibility.
 */

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrderStatus, Prisma } from "@prisma/client";
import { ShippingData } from "./types";

/**
 * Menentukan status order berdasarkan progress yang ada
 * 
 * Logika bisnis untuk menentukan status order:
 * - delivered: Jika ada date_received di shipping progress
 * - shipped: Jika shipping status true dan ada date_shipping
 * - warehouse: Jika warehouse status true
 * - pending: Default status
 * 
 * @param orderId - ID pesanan
 * @returns Promise<OrderStatus> - Status order yang sesuai
 */
export async function determineOrderStatus(orderId: string): Promise<OrderStatus> {
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
 * Fungsi ini akan dipanggil setiap kali ada perubahan progress
 * untuk memastikan status order selalu sinkron dengan progress.
 * 
 * @param orderId - ID pesanan
 */
export async function updateOrderStatus(orderId: string): Promise<void> {
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
 * Validasi order sebelum membuat atau mengupdate progress
 * 
 * Memastikan order exists dan tidak dalam status cancelled.
 * 
 * @param orderId - ID pesanan
 * @throws Error jika order tidak ditemukan atau cancelled
 */
export async function validateOrder(orderId: string): Promise<void> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "cancelled") {
    throw new Error("Cannot modify progress for cancelled order");
  }
}

/**
 * Cek apakah progress untuk stage tertentu sudah ada
 * 
 * @param orderId - ID pesanan
 * @param stage - Tahapan progress
 * @returns Promise<boolean> - true jika sudah ada, false jika belum
 */
export async function checkExistingProgress(orderId: string, stage: string): Promise<boolean> {
  const existingProgress = await db.orderProgress.findFirst({
    where: {
      order_id: orderId,
      stage: stage,
    },
  });

  return !!existingProgress;
}

/**
 * Revalidate cache untuk halaman terkait
 * 
 * @param orderId - ID pesanan
 */
export function revalidateOrderPages(orderId: string): void {
  revalidatePath("/admin/order");
  revalidatePath(`/admin/order/detail/${orderId}`);
}

/**
 * Get progress data untuk stage tertentu
 * 
 * @param orderId - ID pesanan
 * @param stage - Tahapan progress
 * @returns Promise<any> - Data progress atau null jika tidak ada
 */
export async function getStageProgressData(orderId: string, stage: string) {
  const progress = await db.orderProgress.findFirst({
    where: {
      order_id: orderId,
      stage: stage,
    },
  });

  return progress;
}

/**
 * Delete progress berdasarkan ID
 * 
 * @param id - ID progress
 * @returns Promise<boolean> - true jika berhasil dihapus
 */
export async function deleteProgressById(id: string): Promise<boolean> {
  try {
    await db.orderProgress.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Error deleting progress:', error);
    return false;
  }
}
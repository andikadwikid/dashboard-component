import * as z from "zod";
import { MasterCustomerSchema } from "../customer";

// Schema untuk customer selection mode
export const CustomerSelectionSchema = z.object({
  mode: z.enum(["existing", "new"]), // pilih customer existing atau buat baru
  customer_id: z.string().optional(), // ID customer yang dipilih (jika mode existing)
  customer_data: MasterCustomerSchema.omit({
    create_by: true,
    createdAt: true,
    updatedAt: true,
  }).optional(), // data customer baru (jika mode new)
});

// Schema utama untuk order (disederhanakan)
export const OrderSchema = z.object({
  customer_selection: CustomerSelectionSchema,
  customer_history_id: z.string().optional(), // ID dari customer history yang akan dibuat
  // sales_id: z.string().min(1, "Sales ID is required"),
  status: z
    .enum([
      "pending",
      "shipped",
      "delivered",
      "closed",
      "completed",
      "cancelled",
      "amended",
    ])
    .default("pending"),
});

// Schema untuk update order
export const UpdateOrderSchema = OrderSchema.partial();

// Type exports
export type CustomerSelection = z.infer<typeof CustomerSelectionSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
export type OrderFormData = z.infer<typeof OrderSchema>;

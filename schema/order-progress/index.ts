import { z } from "zod";

// Schema untuk data warehouse stage
export const WarehouseDataSchema = z.object({
  status: z.boolean(),
});

// Schema untuk data shipping stage
export const ShippingDataSchema = z.object({
  status: z.boolean(),
  date_shipping: z.string().optional(),
});

// Schema untuk data applied stage
export const AppliedDataSchema = z.object({
  status: z.boolean(),
  est_applied_area: z.union([
    z.number().positive(),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        throw new Error("Invalid number");
      }
      return num;
    })
  ]).optional(),
});

// Schema untuk data result stage
export const ResultDataSchema = z.object({
  status: z.boolean(),
  gain_yield: z.boolean().optional(),
  yield_amount: z.union([
    z.number().positive(),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        throw new Error("Invalid number");
      }
      return num;
    })
  ]).optional(),
});

// Schema utama untuk OrderProgress
export const OrderProgressSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  stage: z.enum(["warehouse", "shipping", "applied", "result"], {
    message: "Stage is required",
  }),
  data: z.union([
    WarehouseDataSchema,
    ShippingDataSchema,
    AppliedDataSchema,
    ResultDataSchema,
  ]),
});

// Schema untuk update progress
export const UpdateOrderProgressSchema = z.object({
  id: z.string().min(1, "Progress ID is required"),
  data: z.union([
    WarehouseDataSchema,
    ShippingDataSchema,
    AppliedDataSchema,
    ResultDataSchema,
  ]),
});

// Type definitions
export type OrderProgressType = z.infer<typeof OrderProgressSchema>;
export type UpdateOrderProgressType = z.infer<typeof UpdateOrderProgressSchema>;
export type WarehouseData = z.infer<typeof WarehouseDataSchema>;
export type ShippingData = z.infer<typeof ShippingDataSchema>;
export type AppliedData = z.infer<typeof AppliedDataSchema>;
export type ResultData = z.infer<typeof ResultDataSchema>;

// Helper function untuk validasi stage-specific data
export const validateStageData = (stage: string, data: unknown) => {
  switch (stage) {
    case "warehouse":
      return WarehouseDataSchema.safeParse(data);
    case "shipping":
      return ShippingDataSchema.safeParse(data);
    case "applied":
      return AppliedDataSchema.safeParse(data);
    case "result":
      return ResultDataSchema.safeParse(data);
    default:
      return { success: false, error: { message: "Invalid stage" } };
  }
};
import * as z from "zod";

export const MasterProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category_id: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be a positive number"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type MasterProduct = z.infer<typeof MasterProductSchema>;
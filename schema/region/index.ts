import * as z from "zod";

export const MasterRegionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Name is required"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

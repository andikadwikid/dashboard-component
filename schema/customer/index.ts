import * as z from "zod";

export const MasterCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  address: z.string().min(1, "Address is required"),
  region_id: z.string().min(1, "Invalid region_id"),
  farm_name: z.string().min(1, "Farm name is required"),
  altitude: z.string().min(1, "Altitude is required"),
  variety: z.string().min(1, "Variety is required"),
  create_by: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

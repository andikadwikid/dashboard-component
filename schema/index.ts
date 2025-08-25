import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email({
    message: "Invalid email address",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const RegisterSchema = z.object({
  email: z.email({
    message: "Invalid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

export const RequestSampleSchema = z.object({
  pic_name: z.string().min(1, {
    message: "PIC name is required",
  }),
  pic_contact: z.string().min(1, {
    message: "PIC contact is required",
  }),
  shipment_address: z.string().min(1, {
    message: "Shipment address is required",
  }),
  region: z.string().min(1, {
    message: "Region is required",
  }),
  farm_name: z.string().min(1, {
    message: "Farm name is required",
  }),
  altitude: z.string().min(1, {
    message: "Altitude is required",
  }),
  variety: z.string().min(1, {
    message: "Variety is required",
  }),
});

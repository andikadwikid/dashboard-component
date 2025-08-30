"use client";

/**
 * ShippingProgressForm Component
 * 
 * Komponen form untuk mengelola progres tahapan pengiriman (shipping) dalam sistem order progress.
 * Form ini memungkinkan pengguna untuk:
 * - Mengatur status pengiriman (sudah dikirim atau belum)
 * - Mencatat tanggal pengiriman
 * - Menyimpan atau memperbarui data progres shipping
 * 
 * Fitur:
 * - Validasi form menggunakan Zod schema
 * - Support untuk create dan update data
 * - Loading state dengan spinner
 * - Toast notifications untuk feedback
 * - Auto-format tanggal pengiriman
 * 
 * Data yang disimpan:
 * - status: boolean - Status apakah sudah dikirim
 * - date_shipping: string - Tanggal pengiriman (optional)
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createOrderProgress, updateOrderProgress } from "@/actions/order-progress";
import { ShippingProgressSchema, type ShippingProgress } from "@/schema/order-progress";
import { Loader2, Truck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Props untuk ShippingProgressForm component
 * 
 * @interface ShippingProgressFormProps
 * @property {string} orderId - ID pesanan yang akan dikelola progres shipping-nya
 * @property {Object|null} [existingData] - Data progres shipping yang sudah ada (untuk mode edit)
 * @property {string} existingData.id - ID record progres yang sudah ada
 * @property {Object} existingData.data - Data progres shipping
 * @property {boolean} existingData.data.status - Status pengiriman
 * @property {string} [existingData.data.date_shipping] - Tanggal pengiriman
 * @property {Function} [onSuccess] - Callback function yang dipanggil setelah berhasil menyimpan
 */
interface ShippingProgressFormProps {
  orderId: string;
  existingData?: {
    id: string;
    data: {
      status: boolean;
      date_shipping?: string;
      date_received?: string;
    };
  } | null;
  onSuccess?: () => void;
  /** Status order untuk menentukan apakah form dapat diakses */
  orderStatus?: string;
}

/**
 * ShippingProgressForm Component
 * 
 * Komponen form untuk mengelola progres tahapan pengiriman dalam order progress system.
 * 
 * @param {ShippingProgressFormProps} props - Props untuk komponen
 * @returns {JSX.Element} Form component untuk shipping progress
 * 
 * @example
 * ```tsx
 * // Untuk membuat progres shipping baru
 * <ShippingProgressForm 
 *   orderId="order-123"
 *   onSuccess={() => console.log('Shipping progress created')}
 * />
 * 
 * // Untuk mengedit progres shipping yang sudah ada
 * <ShippingProgressForm 
 *   orderId="order-123"
 *   existingData={{
 *     id: "progress-456",
 *     data: {
 *       status: true,
 *       date_shipping: "2024-01-15"
 *     }
 *   }}
 *   onSuccess={() => console.log('Shipping progress updated')}
 * />
 * ```
 */
export function ShippingProgressForm({
  orderId,
  existingData,
  onSuccess,
  orderStatus,
}: ShippingProgressFormProps) {
  // State untuk loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // Setup form dengan react-hook-form dan Zod validation
  const form = useForm<ShippingProgress>({
    resolver: zodResolver(ShippingProgressSchema),
    defaultValues: {
      order_id: orderId,
      stage: "shipping",
      data: {
        status: existingData?.data?.status || false,
        date_shipping: existingData?.data?.date_shipping || "",
        date_received: existingData?.data?.date_received || "",
      },
    },
  });

  const watchStatus = form.watch("data.status");

  const onSubmit = async (values: ShippingProgress) => {
    setIsLoading(true);
    try {

      const formData = new FormData();
      formData.append("order_id", values.order_id);
      formData.append("stage", values.stage);
      formData.append("data", JSON.stringify(values.data));

      let result;
      if (existingData?.id) {
        result = await updateOrderProgress(existingData.id, formData);
      } else {
        result = await createOrderProgress(formData);
      }

      if (result.success) {
        toast.success(result.message || "Shipping progress updated successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update shipping progress");
      }
    } catch (error) {
      console.error("Error submitting shipping progress:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="data.status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">
                    Goods Shipped
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Select whether goods have been shipped
                  </div>
                  <FormControl>
                    <Select
                      value={field.value ? "yes" : "no"}
                      onValueChange={(value) => {
                        const isYes = value === "yes";
                        field.onChange(isYes);
                        // Auto-set current date when "Yes" is selected
                        if (isYes && !form.getValues("data.date_shipping")) {
                          form.setValue(
                            "data.date_shipping",
                            format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
                          );
                        }
                      }}
                      disabled={isLoading || orderStatus === 'cancelled' || orderStatus === 'completed'}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchStatus && (
              <>
                <FormField
                  control={form.control}
                  name="data.date_shipping"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Date</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value
                              ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm")
                              : ""
                          }
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value).toISOString()
                              : "";
                            field.onChange(date);
                          }}
                          disabled={isLoading || orderStatus === 'cancelled' || orderStatus === 'completed'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data.date_received"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Received Date</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value
                              ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm")
                              : ""
                          }
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value).toISOString()
                              : "";
                            field.onChange(date);
                          }}
                          disabled={isLoading || orderStatus === 'cancelled' || orderStatus === 'completed'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || orderStatus === 'cancelled' || orderStatus === 'completed'}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingData ? "Update" : "Save"} Shipping Status
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
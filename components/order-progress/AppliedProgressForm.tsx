"use client";

/**
 * AppliedProgressForm Component
 * 
 * Komponen form untuk mengelola progres tahapan aplikasi (applied) dalam sistem order progress.
 * Form ini memungkinkan pengguna untuk:
 * - Input estimasi area yang diaplikasikan
 * - Input area aktual yang telah diaplikasikan
 * - Menyimpan atau memperbarui data progres applied
 * 
 * Fitur:
 * - Validasi form menggunakan Zod schema
 * - Support untuk create dan update data
 * - Loading state dengan spinner
 * - Toast notifications untuk feedback
 * - Input numerik untuk area dalam satuan hektar
 * 
 * Data yang disimpan:
 * - est_applied_area: number - Estimasi area yang diaplikasikan (dalam hektar)
 * - actual_applied_area: number - Area aktual yang telah diaplikasikan (dalam hektar, optional)
 * 
 * Kondisi Completed:
 * - Tahapan ini dianggap selesai jika est_applied_area > 0
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createOrderProgress, updateOrderProgress } from "@/actions/order-progress";
import { AppliedProgressSchema, type AppliedProgress } from "@/schema/order-progress";
import { Loader2, MapPin } from "lucide-react";

/**
 * Props untuk AppliedProgressForm component
 * 
 * @interface AppliedProgressFormProps
 * @property {string} orderId - ID pesanan yang akan dikelola progres applied-nya
 * @property {Object|null} [existingData] - Data progres applied yang sudah ada (untuk mode edit)
 * @property {string} existingData.id - ID record progres yang sudah ada
 * @property {Object} existingData.data - Data progres applied
 * @property {number} existingData.data.est_applied_area - Estimasi area yang diaplikasikan (hektar)
 * @property {number} [existingData.data.actual_applied_area] - Area aktual yang diaplikasikan (hektar, optional)
 * @property {Function} [onSuccess] - Callback function yang dipanggil setelah berhasil menyimpan
 */
interface AppliedProgressFormProps {
  orderId: string;
  existingData?: {
    id: string;
    data: {
      est_applied_area: number;
      actual_applied_area?: number;
    };
  } | null;
  onSuccess?: () => void;
  // Status order untuk disable form jika cancelled
  orderStatus?: string;
}

/**
 * AppliedProgressForm Component
 * 
 * Komponen form untuk mengelola progres tahapan aplikasi dalam order progress system.
 * 
 * @param {AppliedProgressFormProps} props - Props untuk komponen
 * @returns {JSX.Element} Form component untuk applied progress
 * 
 * @example
 * ```tsx
 * // Untuk membuat progres applied baru
 * <AppliedProgressForm 
 *   orderId="order-123"
 *   onSuccess={() => console.log('Applied progress created')}
 * />
 * 
 * // Untuk mengedit progres applied yang sudah ada
 * <AppliedProgressForm 
 *   orderId="order-123"
 *   existingData={{
 *     id: "progress-456",
 *     data: {
 *       est_applied_area: 150.5
 *     }
 *   }}
 *   onSuccess={() => console.log('Applied progress updated')}
 * />
 * ```
 */
export function AppliedProgressForm({
  orderId,
  existingData,
  onSuccess,
  orderStatus,
}: AppliedProgressFormProps) {
  // State untuk loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // Setup form dengan react-hook-form dan Zod validation
  const form = useForm<AppliedProgress>({
    resolver: zodResolver(AppliedProgressSchema),
    defaultValues: {
      order_id: orderId,
      stage: "applied",
      data: {
        est_applied_area: existingData?.data?.est_applied_area || 0,
        actual_applied_area: existingData?.data?.actual_applied_area || undefined,
      },
    },
  });

  const onSubmit = async (values: AppliedProgress) => {
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
        toast.success(result.message || "Application progress updated successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update application progress");
      }
    } catch (error) {
      console.error("Error submitting application progress:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Application Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="data.est_applied_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Est. Applied Area (ha)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter estimated applied area in hectares"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseFloat(value) : 0);
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
              name="data.actual_applied_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actual Applied Area (ha)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter actual applied area in hectares"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseFloat(value) : undefined);
                      }}
                      disabled={isLoading || orderStatus === 'cancelled' || orderStatus === 'completed'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              Unit: hectares (ha)
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || orderStatus === 'cancelled' || orderStatus === 'completed'}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingData ? "Update" : "Save"} Application Data
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
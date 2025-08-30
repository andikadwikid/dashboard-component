"use client";

/**
 * ResultProgressForm Component
 * 
 * Komponen form untuk mengelola progres tahapan hasil (result) dalam sistem order progress.
 * Form ini memungkinkan pengguna untuk:
 * - Input hasil yield (gain atau no_gain)
 * - Input jumlah yield jika hasilnya gain
 * - Menyimpan atau memperbarui data progres result
 * 
 * Fitur:
 * - Validasi form menggunakan Zod schema
 * - Support untuk create dan update data
 * - Loading state dengan spinner
 * - Toast notifications untuk feedback
 * - Conditional field untuk yield_amount
 * - Select dropdown untuk yield_result
 * 
 * Data yang disimpan:
 * - yield_result: "gain" | "no_gain" - Hasil yield
 * - yield_amount: number - Jumlah yield (optional, hanya jika gain)
 * 
 * Kondisi Completed:
 * - Tahapan ini dianggap selesai jika yield_result ada (tidak null/undefined)
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createOrderProgress, updateOrderProgress } from "@/actions/order-progress";
import { ResultProgressSchema, type ResultProgress } from "@/schema/order-progress";
import { Loader2, BarChart3 } from "lucide-react";

/**
 * Props untuk ResultProgressForm component
 * 
 * @interface ResultProgressFormProps
 * @property {string} orderId - ID pesanan yang akan dikelola progres result-nya
 * @property {Object|null} [existingData] - Data progres result yang sudah ada (untuk mode edit)
 * @property {string} existingData.id - ID record progres yang sudah ada
 * @property {Object} existingData.data - Data progres result
 * @property {"gain"|"no_gain"} existingData.data.yield_result - Hasil yield
 * @property {number} [existingData.data.yield_amount] - Jumlah yield (jika gain)
 * @property {Function} [onSuccess] - Callback function yang dipanggil setelah berhasil menyimpan
 */
interface ResultProgressFormProps {
  orderId: string;
  existingData?: {
    id: string;
    data: {
      yield_result: "gain" | "no_gain";
      yield_amount?: number;
    };
  } | null;
  onSuccess?: () => void;
}

/**
 * ResultProgressForm Component
 * 
 * Komponen form untuk mengelola progres tahapan hasil dalam order progress system.
 * 
 * @param {ResultProgressFormProps} props - Props untuk komponen
 * @returns {JSX.Element} Form component untuk result progress
 * 
 * @example
 * ```tsx
 * // Untuk membuat progres result baru
 * <ResultProgressForm 
 *   orderId="order-123"
 *   onSuccess={() => console.log('Result progress created')}
 * />
 * 
 * // Untuk mengedit progres result yang sudah ada
 * <ResultProgressForm 
 *   orderId="order-123"
 *   existingData={{
 *     id: "progress-456",
 *     data: {
 *       yield_result: "gain",
 *       yield_amount: 75.5
 *     }
 *   }}
 *   onSuccess={() => console.log('Result progress updated')}
 * />
 * ```
 */
export function ResultProgressForm({
  orderId,
  existingData,
  onSuccess,
}: ResultProgressFormProps) {
  // State untuk loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // Setup form dengan react-hook-form dan Zod validation
  const form = useForm<ResultProgress>({
    resolver: zodResolver(ResultProgressSchema),
    defaultValues: {
      order_id: orderId,
      stage: "result",
      data: {
        yield_result: existingData?.data?.yield_result || "no_gain",
        yield_amount: existingData?.data?.yield_amount || undefined,
      },
    },
  });

  const watchYieldResult = form.watch("data.yield_result");

  const onSubmit = async (values: ResultProgress) => {
    setIsLoading(true);
    try {
      // Remove yield_amount if result is no_gain
      if (values.data.yield_result === "no_gain") {
        delete values.data.yield_amount;
      }

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
        toast.success(result.message || "Result progress updated successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update result progress");
      }
    } catch (error) {
      console.error("Error submitting result progress:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Yield Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="data.yield_result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yield Result</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Clear yield_amount when switching to no_gain
                      if (value === "no_gain") {
                        form.setValue("data.yield_amount", undefined);
                      }
                    }}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select yield result" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gain">Gain Yield</SelectItem>
                      <SelectItem value="no_gain">No Gain</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchYieldResult === "gain" && (
              <FormField
                control={form.control}
                name="data.yield_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yield Amount (Numerical)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter yield amount"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingData ? "Update" : "Save"} Result Data
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
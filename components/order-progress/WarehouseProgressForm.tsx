"use client";

/**
 * Warehouse Progress Form Component
 * 
 * Komponen form untuk input progres tahapan warehouse (gudang).
 * Tahapan ini adalah tahapan pertama dalam alur progres pesanan.
 * 
 * Fitur:
 * - Input status warehouse (checkbox)
 * - Validasi menggunakan Zod schema
 * - Support create dan update data
 * - Loading state dan error handling
 * - Auto-refresh parent component setelah submit
 * 
 * Data yang disimpan:
 * - status: boolean - Status apakah warehouse sudah siap
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createOrderProgress, updateOrderProgress } from "@/actions/order-progress";
import { WarehouseProgressSchema, type WarehouseProgress } from "@/schema/order-progress";
import { Loader2, Package } from "lucide-react";

/**
 * Props untuk WarehouseProgressForm component
 */
interface WarehouseProgressFormProps {
  /** ID pesanan yang akan diupdate progresnya */
  orderId: string;
  /** Data existing jika sudah ada (untuk mode edit) */
  existingData?: {
    /** ID progres di database */
    id: string;
    /** Data warehouse yang sudah tersimpan */
    data: {
      /** Status warehouse - true jika sudah siap */
      status: boolean;
    };
  } | null;
  /** Callback yang dipanggil setelah berhasil submit */
  onSuccess?: () => void;
}

/**
 * Komponen form untuk input progres warehouse
 * 
 * @param orderId - ID pesanan
 * @param existingData - Data existing untuk mode edit
 * @param onSuccess - Callback setelah berhasil submit
 */
export function WarehouseProgressForm({
  orderId,
  existingData,
  onSuccess,
}: WarehouseProgressFormProps) {
  // State untuk loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // Setup form dengan react-hook-form dan zod validation
  const form = useForm<WarehouseProgress>({
    resolver: zodResolver(WarehouseProgressSchema),
    defaultValues: {
      order_id: orderId,
      stage: "warehouse",
      data: {
        status: existingData?.data?.status || false,
      },
    },
  });

  const onSubmit = async (values: WarehouseProgress) => {
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
        toast.success(result.message || "Warehouse progress updated successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update warehouse progress");
      }
    } catch (error) {
      console.error("Error submitting warehouse progress:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Warehouse Status
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
                    Goods Released from Warehouse
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Select whether goods have been released from warehouse
                  </div>
                  <FormControl>
                    <Select
                      value={field.value ? "yes" : "no"}
                      onValueChange={(value) => field.onChange(value === "yes")}
                      disabled={isLoading}
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

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingData ? "Update" : "Save"} Warehouse Status
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
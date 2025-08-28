"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createOrderProgress, updateOrderProgress } from "@/actions/order-progress";
import { X } from "lucide-react";

interface OrderProgressFormProps {
  orderId: string;
  stage: string;
  existingProgress?: any;
  onClose: () => void;
}

export function OrderProgressForm({
  orderId,
  stage,
  existingProgress,
  onClose,
}: OrderProgressFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      status: false,
      date_shipping: "",
      est_applied_area: "",
      gain_yield: false,
      yield_amount: "",
    };

    if (existingProgress?.data) {
      return { ...defaultData, ...existingProgress.data };
    }

    return defaultData;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = { status: formData.status };

      // Add stage-specific data
      switch (stage) {
        case "shipping":
          if (formData.status && !formData.date_shipping) {
            toast.error("Tanggal shipping harus diisi jika status aktif");
            setLoading(false);
            return;
          }
          if (formData.date_shipping) {
            data.date_shipping = formData.date_shipping;
          }
          break;
        case "applied":
          if (formData.status && !formData.est_applied_area) {
            toast.error("Luas area harus diisi jika status aktif");
            setLoading(false);
            return;
          }
          if (formData.est_applied_area) {
            data.est_applied_area = formData.est_applied_area;
          }
          break;
        case "result":
          if (formData.status) {
            data.gain_yield = formData.gain_yield;
            if (formData.gain_yield && formData.yield_amount) {
              data.yield_amount = formData.yield_amount;
            }
          }
          break;
      }

      let result;
      if (existingProgress) {
        result = await updateOrderProgress({
          id: existingProgress.id,
          data,
        });
      } else {
        result = await createOrderProgress({
          order_id: orderId,
          stage: stage as "warehouse" | "shipping" | "applied" | "result",
          data,
        });
      }

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const renderStageFields = () => {
    switch (stage) {
      case "warehouse":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status"
                checked={formData.status}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, status: checked })
                }
              />
              <Label htmlFor="status">Barang sudah keluar dari gudang</Label>
            </div>
          </div>
        );

      case "shipping":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status"
                checked={formData.status}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, status: checked })
                }
              />
              <Label htmlFor="status">Barang sudah dikirim</Label>
            </div>
            {formData.status && (
              <div className="space-y-2">
                <Label htmlFor="date_shipping">Tanggal Pengiriman</Label>
                <Input
                  id="date_shipping"
                  type="datetime-local"
                  value={formData.date_shipping}
                  onChange={(e) =>
                    setFormData({ ...formData, date_shipping: e.target.value })
                  }
                  required={formData.status}
                />
              </div>
            )}
          </div>
        );

      case "applied":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status"
                checked={formData.status}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, status: checked })
                }
              />
              <Label htmlFor="status">Produk sudah diaplikasikan</Label>
            </div>
            {formData.status && (
              <div className="space-y-2">
                <Label htmlFor="est_applied_area">Luas Area Aplikasi (ha)</Label>
                <Input
                  id="est_applied_area"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.est_applied_area}
                  onChange={(e) =>
                    setFormData({ ...formData, est_applied_area: e.target.value })
                  }
                  placeholder="Masukkan luas area dalam hektar"
                  required={formData.status}
                />
              </div>
            )}
          </div>
        );

      case "result":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status"
                checked={formData.status}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, status: checked })
                }
              />
              <Label htmlFor="status">Ada hasil</Label>
            </div>
            {formData.status && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gain_yield"
                    checked={formData.gain_yield}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, gain_yield: checked })
                    }
                  />
                  <Label htmlFor="gain_yield">Ada peningkatan yield</Label>
                </div>
                {formData.gain_yield && (
                  <div className="space-y-2">
                    <Label htmlFor="yield_amount">Jumlah Yield</Label>
                    <Input
                      id="yield_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.yield_amount}
                      onChange={(e) =>
                        setFormData({ ...formData, yield_amount: e.target.value })
                      }
                      placeholder="Masukkan jumlah yield"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getStageTitle = () => {
    switch (stage) {
      case "warehouse":
        return "Warehouse Progress";
      case "shipping":
        return "Shipping Progress";
      case "applied":
        return "Applied Progress";
      case "result":
        return "Result Progress";
      default:
        return "Progress";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{getStageTitle()}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderStageFields()}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
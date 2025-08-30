"use client";

/**
 * Order Progress Manager Component
 * 
 * Komponen utama untuk mengelola progres pesanan dengan sistem input bertahap.
 * Komponen ini mengimplementasikan validasi urutan tahapan dimana pengguna harus
 * menyelesaikan tahapan sebelumnya untuk dapat melanjutkan ke tahapan berikutnya.
 * 
 * Urutan tahapan:
 * 1. Warehouse (Gudang) - Input data gudang dan status
 * 2. Shipping (Pengiriman) - Input data pengiriman dan status  
 * 3. Applied (Aplikasi) - Input estimasi area aplikasi
 * 4. Result (Hasil) - Input hasil yield
 * 
 * Features:
 * - Real-time progress tracking
 * - Sequential stage validation
 * - Visual progress indicators
 * - Form locking untuk tahapan yang belum dapat diakses
 * - Auto-refresh setelah update data
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getOrderProgressByOrderId, getProgressStagesStatus } from "@/actions/order-progress";
import { WarehouseProgressForm } from "./WarehouseProgressForm";
import { ShippingProgressForm } from "./ShippingProgressForm";
import { AppliedProgressForm } from "./AppliedProgressForm";
import { ResultProgressForm } from "./ResultProgressForm";
import { CheckCircle, Circle, Clock, Package, Truck, MapPin, BarChart3 } from "lucide-react";
import { toast } from "sonner";

/**
 * Props untuk OrderProgressManager component
 */
interface OrderProgressManagerProps {
  /** ID pesanan yang akan dikelola progresnya */
  orderId: string;
}

/**
 * Interface untuk data progres dari database
 */
interface ProgressData {
  /** ID unik progres */
  id: string;
  /** Tahapan progres (warehouse, shipping, applied, result) */
  stage: string;
  /** Data JSON yang berisi informasi spesifik untuk setiap tahapan */
  data: Record<string, unknown>;
  /** Tanggal pembuatan */
  createdAt: Date;
  /** Tanggal terakhir diupdate */
  updatedAt: Date | null;
}

/**
 * Interface untuk status completed setiap tahapan
 */
interface StageStatus {
  /** Status warehouse - true jika data.status === true */
  warehouse: boolean;
  /** Status shipping - true jika data.status === true */
  shipping: boolean;
  /** Status applied - true jika data.est_applied_area > 0 */
  applied: boolean;
  /** Status result - true jika data.yield_result exists */
  result: boolean;
}

/**
 * Komponen utama untuk mengelola progres pesanan
 * 
 * @param orderId - ID pesanan yang akan dikelola progresnya
 */
export function OrderProgressManager({ orderId }: OrderProgressManagerProps) {
  // State untuk menyimpan data progres dari database
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  
  // State untuk menyimpan status completed setiap tahapan
  const [stageStatus, setStageStatus] = useState<StageStatus>({
    warehouse: false,
    shipping: false,
    applied: false,
    result: false,
  });
  
  // State untuk loading indicator
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fungsi untuk mengambil data progres dari server
   * Dipanggil saat component mount dan setelah update data
   */
  const fetchProgressData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [progressResult, statusResult] = await Promise.all([
        getOrderProgressByOrderId(orderId),
        getProgressStagesStatus(orderId),
      ]);

      if (progressResult.success && progressResult.data) {
        setProgressData(progressResult.data as ProgressData[]);
      }

      if (statusResult.success && statusResult.data) {
        // Convert status array to StageStatus object
        const statusObj: StageStatus = {
          warehouse: false,
          shipping: false,
          applied: false,
          result: false,
        };

        statusResult.data.forEach((item: { stage: string; completed: boolean }) => {
          if (item.stage in statusObj) {
            statusObj[item.stage as keyof StageStatus] = item.completed;
          }
        });

        setStageStatus(statusObj);
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
      toast.error("Failed to load progress data");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Effect untuk load data saat component mount atau orderId berubah
  useEffect(() => {
    fetchProgressData();
  }, [orderId, fetchProgressData]);

  /**
   * Mengambil data progres untuk tahapan tertentu
   * 
   * @param stage - Nama tahapan (warehouse, shipping, applied, result)
   * @returns Data progres untuk tahapan tersebut atau undefined jika tidak ada
   */
  const getStageData = (stage: string) => {
    return progressData.find((p) => p.stage === stage);
  };

  /**
   * Mengembalikan icon yang sesuai untuk setiap tahapan
   * 
   * @param stage - Nama tahapan
   * @param completed - Status apakah tahapan sudah selesai
   * @returns React element icon yang sesuai
   */
  const getStageIcon = (stage: string, completed: boolean) => {
    const iconProps = { className: "h-5 w-5" };

    switch (stage) {
      case "warehouse":
        return <Package {...iconProps} />;
      case "shipping":
        return <Truck {...iconProps} />;
      case "applied":
        return <MapPin {...iconProps} />;
      case "result":
        return <BarChart3 {...iconProps} />;
      default:
        return completed ? <CheckCircle {...iconProps} /> : <Circle {...iconProps} />;
    }
  };

  /**
   * Mengembalikan judul yang sesuai untuk setiap tahapan
   * 
   * @param stage - Nama tahapan
   * @returns Judul yang user-friendly untuk tahapan
   */
  const getStageTitle = (stage: string) => {
    switch (stage) {
      case "warehouse":
        return "Warehouse";
      case "shipping":
        return "Shipping";
      case "applied":
        return "Applied";
      case "result":
        return "Result";
      default:
        return stage;
    }
  };

  // Array urutan tahapan yang harus diikuti
  const stages = ["warehouse", "shipping", "applied", "result"];

  /**
   * Mengecek apakah semua tahapan sebelumnya sudah selesai
   * 
   * @param currentStage - Tahapan yang akan dicek
   * @returns true jika semua tahapan sebelumnya sudah selesai, false jika belum
   * 
   * @example
   * isPreviousStageCompleted("shipping") // true jika warehouse sudah selesai
   * isPreviousStageCompleted("result") // true jika warehouse, shipping, dan applied sudah selesai
   */
  const isPreviousStageCompleted = (currentStage: string): boolean => {
    const stageIndex = stages.indexOf(currentStage);
    if (stageIndex === 0) return true; // Tahapan pertama selalu dapat diakses

    // Cek apakah semua tahapan sebelumnya sudah selesai
    for (let i = 0; i < stageIndex; i++) {
      const prevStage = stages[i] as keyof StageStatus;
      if (!stageStatus[prevStage]) {
        return false;
      }
    }
    return true;
  };

  /**
   * Mendapatkan tahapan berikutnya yang belum selesai
   * 
   * @returns Nama tahapan berikutnya yang belum selesai, atau null jika semua sudah selesai
   * 
   * @example
   * getNextIncompleteStage() // "warehouse" jika warehouse belum selesai
   * getNextIncompleteStage() // null jika semua tahapan sudah selesai
   */
  const getNextIncompleteStage = (): string | null => {
    for (const stage of stages) {
      if (!stageStatus[stage as keyof StageStatus]) {
        return stage;
      }
    }
    return null; // Semua tahapan sudah selesai
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Order Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading progress data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Order Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stages.map((stage) => {
              const completed = stageStatus[stage as keyof StageStatus];
              return (
                <div
                  key={stage}
                  className="flex items-center gap-2 p-3 rounded-lg border"
                >
                  {getStageIcon(stage, completed)}
                  <div className="flex-1">
                    <div className="font-medium">{getStageTitle(stage)}</div>
                    <Badge
                      variant={completed ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {completed ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Progress Forms */}
      <div className="grid gap-6">
        {/* Warehouse Form - Always accessible */}
        <div className="relative">
          <WarehouseProgressForm
            orderId={orderId}
            existingData={getStageData("warehouse") as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            onSuccess={fetchProgressData}
          />
        </div>

        {/* Shipping Form - Requires warehouse completion */}
        <div className="relative">
          {!isPreviousStageCompleted("shipping") && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Complete Warehouse stage first
                </div>
                <Badge variant="outline" className="text-xs">
                  Locked
                </Badge>
              </div>
            </div>
          )}
          <ShippingProgressForm
            orderId={orderId}
            existingData={getStageData("shipping") as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            onSuccess={fetchProgressData}
          />
        </div>

        {/* Applied Form - Requires shipping completion */}
        <div className="relative">
          {!isPreviousStageCompleted("applied") && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Complete {getNextIncompleteStage() === "shipping" ? "Shipping" : "previous"} stage first
                </div>
                <Badge variant="outline" className="text-xs">
                  Locked
                </Badge>
              </div>
            </div>
          )}
          <AppliedProgressForm
            orderId={orderId}
            existingData={getStageData("applied") as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            onSuccess={fetchProgressData}
          />
        </div>

        {/* Result Form - Requires applied completion */}
        <div className="relative">
          {!isPreviousStageCompleted("result") && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Complete {getNextIncompleteStage() === "applied" ? "Applied" : "previous"} stage first
                </div>
                <Badge variant="outline" className="text-xs">
                  Locked
                </Badge>
              </div>
            </div>
          )}
          <ResultProgressForm
            orderId={orderId}
            existingData={getStageData("result") as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            onSuccess={fetchProgressData}
          />
        </div>
      </div>
    </div>
  );
}